/**
 * holisticLandmarker.ts
 *
 * Browser-side dual-model implementation of MediaPipe Holistic.
 * Mirrors the feature extraction logic from isl_dtw/utils.py:
 *   - 106-dim feature vector per frame
 *   - Pose (upper body + head anchors) normalized to mid-shoulder
 *   - Left/Right hands normalized to respective wrists
 *   - Zero-padded when parts are missing
 */

import {
  HandLandmarker,
  PoseLandmarker,
  FilesetResolver,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

let poseLandmarker: PoseLandmarker | null = null;
let handLandmarker: HandLandmarker | null = null;
let lastVideoTime = -1;

export const FEATURE_DIM = 106;

// Pose landmark indices
const POSE_UPPER_BODY_INDICES = [11, 12, 13, 14, 15, 16]; // shoulders, elbows, wrists
const POSE_HEAD_INDICES = [0, 2, 5, 9, 10]; // nose, left eye, right eye, mouth left, mouth right

// Topology for drawing
export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index finger
  [9, 10], [10, 11], [11, 12],    // Middle finger
  [13, 14], [14, 15], [15, 16],   // Ring finger
  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [5, 9], [9, 13], [13, 17],      // Palm knuckles
];

export const POSE_UPPER_BODY_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16] // shoulders, upper arms, lower arms
];

export interface HolisticResult {
  pose: NormalizedLandmark[] | null;
  leftHand: NormalizedLandmark[] | null;
  rightHand: NormalizedLandmark[] | null;
}

/**
 * Initialize the PoseLandmarker and HandLandmarker models.
 */
export async function initHolisticLandmarker(): Promise<void> {
  if (poseLandmarker && handLandmarker) return;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  const [pose, hand] = await Promise.all([
    PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.7,
    }),
    HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2, // Need both hands for holistic
      minHandDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })
  ]);

  poseLandmarker = pose;
  handLandmarker = hand;
}

/**
 * Detect pose and hands from a video element.
 */
export function detectHolistic(videoElement: HTMLVideoElement): HolisticResult {
  const result: HolisticResult = {
    pose: null,
    leftHand: null,
    rightHand: null,
  };

  if (!poseLandmarker || !handLandmarker) return result;

  const currentTime = videoElement.currentTime;
  if (currentTime <= lastVideoTime) return result;
  lastVideoTime = currentTime;

  try {
    const timestamp = performance.now();
    const poseResult = poseLandmarker.detectForVideo(videoElement, timestamp);
    const handResult = handLandmarker.detectForVideo(videoElement, timestamp);

    if (poseResult.landmarks && poseResult.landmarks.length > 0) {
      result.pose = poseResult.landmarks[0];
    }

    if (handResult.landmarks && handResult.handednesses) {
      // HandLandmarker returns handedness based on the image perspective.
      // Since we flip X later to match Python's cv2.flip(frame, 1),
      // we need to be careful with left/right assignment.
      // Python MediaPipe Holistic assigns left/right based on subject's perspective in the *flipped* frame.
      // In JS, "Left" from tasks-vision on an unflipped selfie feed actually corresponds to the subject's right hand.
      // However, after we flip X (1.0 - x), it maps correctly to the Python extracted features if we just
      // use the handedness labels directly (Left handedness -> Left Hand feature block).
      for (let i = 0; i < handResult.landmarks.length; i++) {
        const hand = handResult.landmarks[i];
        const category = handResult.handednesses[i][0].categoryName; // "Left" or "Right"
        
        // Note: In selfie mode, what looks like the left hand on screen is the subject's right hand.
        // But because we flip the X coordinate (1.0 - X) during extraction, we effectively mirror it back.
        // We will assign based on the Tasks API label.
        if (category === "Left" && !result.leftHand) {
          result.leftHand = hand;
        } else if (category === "Right" && !result.rightHand) {
          result.rightHand = hand;
        }
      }
    }

    return result;
  } catch {
    return result;
  }
}

/**
 * Extract a 106-dimensional translation-invariant feature vector.
 * Mirrors isl_dtw/utils.py extract_holistic_features()
 */
export function extractHolisticFeatureVector(result: HolisticResult): Float32Array {
  const featureVector = new Float32Array(FEATURE_DIM); // implicitly zero-padded

  let offset = 0;

  // 1. Pose features (12 + 10 = 22 dims)
  if (result.pose && result.pose.length >= 17) {
    // IMPORTANT: Mirror X coordinates to match Python's cv2.flip(frame, 1)
    const midShoulderX = ( (1.0 - result.pose[11].x) + (1.0 - result.pose[12].x) ) / 2.0;
    const midShoulderY = ( result.pose[11].y + result.pose[12].y ) / 2.0;

    // Upper body (indices 11-16)
    for (const idx of POSE_UPPER_BODY_INDICES) {
      featureVector[offset++] = (1.0 - result.pose[idx].x) - midShoulderX;
      featureVector[offset++] = result.pose[idx].y - midShoulderY;
    }

    // Head anchors (indices 0, 2, 5, 9, 10)
    for (const idx of POSE_HEAD_INDICES) {
      featureVector[offset++] = (1.0 - result.pose[idx].x) - midShoulderX;
      featureVector[offset++] = result.pose[idx].y - midShoulderY;
    }
  } else {
    offset += 22; // skip pose block
  }

  // 2. Left Hand (42 dims)
  if (result.leftHand && result.leftHand.length >= 21) {
    const wristX = 1.0 - result.leftHand[0].x;
    const wristY = result.leftHand[0].y;

    for (let i = 0; i < 21; i++) {
      featureVector[offset++] = (1.0 - result.leftHand[i].x) - wristX;
      featureVector[offset++] = result.leftHand[i].y - wristY;
    }
  } else {
    offset += 42; // skip left hand
  }

  // 3. Right Hand (42 dims)
  if (result.rightHand && result.rightHand.length >= 21) {
    const wristX = 1.0 - result.rightHand[0].x;
    const wristY = result.rightHand[0].y;

    for (let i = 0; i < 21; i++) {
      featureVector[offset++] = (1.0 - result.rightHand[i].x) - wristX;
      featureVector[offset++] = result.rightHand[i].y - wristY;
    }
  }

  return featureVector;
}

/**
 * Check if the feature vector has any non-zero values (body detected).
 */
export function isBodyDetected(featureVector: Float32Array): boolean {
  for (let i = 0; i < featureVector.length; i++) {
    if (featureVector[i] !== 0) return true;
  }
  return false;
}

/**
 * Cleanup the landmarker instances.
 */
export function closeHolisticLandmarker(): void {
  if (poseLandmarker) {
    poseLandmarker.close();
    poseLandmarker = null;
  }
  if (handLandmarker) {
    handLandmarker.close();
    handLandmarker = null;
  }
  lastVideoTime = -1;
}
