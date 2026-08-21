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
let lastPose: NormalizedLandmark[] | null = null;
let extractionCounter = 0;

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

// Pinned WASM version for reliability
const MEDIAPIPE_WASM_VERSION = "0.10.21";
const MEDIAPIPE_WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_WASM_VERSION}/wasm`;

/**
 * Create a landmarker with GPU delegate, falling back to CPU if WebGL is unavailable.
 */
async function createWithGpuFallback<T>(
  factory: (delegate: "GPU" | "CPU") => Promise<T>,
  label: string
): Promise<T> {
  try {
    const result = await factory("GPU");
    console.log(`[Holistic] ${label}: GPU delegate active ✓`);
    return result;
  } catch (gpuErr) {
    console.warn(`[Holistic] ${label}: GPU delegate failed, falling back to CPU:`, gpuErr);
    const result = await factory("CPU");
    console.log(`[Holistic] ${label}: CPU delegate active (GPU fallback)`);
    return result;
  }
}

/**
 * Initialize the PoseLandmarker and HandLandmarker models.
 * Uses GPU delegation with automatic CPU fallback.
 */
export async function initHolisticLandmarker(): Promise<void> {
  if (poseLandmarker && handLandmarker) return;

  const t0 = performance.now();
  console.log("[Holistic] Initializing MediaPipe models...");

  const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
  const t1 = performance.now();
  console.log(`[Holistic] WASM fileset resolved in ${(t1 - t0).toFixed(0)}ms`);

  const [pose, hand] = await Promise.all([
    createWithGpuFallback(
      (delegate) =>
        PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
            delegate,
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.7,
        }),
      "PoseLandmarker"
    ),
    createWithGpuFallback(
      (delegate) =>
        HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate,
          },
          runningMode: "VIDEO",
          numHands: 2, // Need both hands for holistic
          minHandDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        }),
      "HandLandmarker"
    ),
  ]);

  poseLandmarker = pose;
  handLandmarker = hand;

  const t2 = performance.now();
  console.log(`[Holistic] Models initialized in ${(t2 - t0).toFixed(0)}ms total`);
}

/**
 * Detect pose and hands from a video element.
 * Throttles pose detection to 1 in every 4 cycles to save GPU time,
 * caching lastPose for intermediate frames.
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

    extractionCounter++;
    const shouldUpdatePose = (extractionCounter % 4) === 1; // 1st frame out of every 4

    if (shouldUpdatePose) {
      const poseResult = poseLandmarker.detectForVideo(videoElement, timestamp);
      if (poseResult.landmarks && poseResult.landmarks.length > 0) {
        lastPose = poseResult.landmarks[0];
      }
    }

    result.pose = lastPose;

    const handResult = handLandmarker.detectForVideo(videoElement, timestamp);

    if (handResult.landmarks && handResult.handednesses) {
      for (let i = 0; i < handResult.landmarks.length; i++) {
        const hand = handResult.landmarks[i];
        const category = handResult.handednesses[i][0].categoryName; // "Left" or "Right"

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
    const midShoulderX = ((1.0 - result.pose[11].x) + (1.0 - result.pose[12].x)) / 2.0;
    const midShoulderY = (result.pose[11].y + result.pose[12].y) / 2.0;

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
  lastPose = null;
  extractionCounter = 0;
}
