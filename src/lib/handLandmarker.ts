/**
 * handLandmarker.ts
 *
 * Browser-side MediaPipe HandLandmarker wrapper.
 * Mirrors the feature extraction logic from isl_dtw/utils.py:
 *   - 21 hand landmarks × 2 (x, y) = 42-dim feature vector
 *   - Translation invariance: subtract wrist (landmark 0) from all points
 *   - Zero-padded when no hand detected
 */

import {
  HandLandmarker,
  FilesetResolver,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

let handLandmarker: HandLandmarker | null = null;
let lastVideoTime = -1;

// MediaPipe Hand connections topology (same as isl_dtw/utils.py HAND_CONNECTIONS)
export const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [9, 10], [10, 11], [11, 12],
  // Ring finger
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm knuckles
  [5, 9], [9, 13], [13, 17],
];

/**
 * Initialize the HandLandmarker model. Must be called once before detection.
 * Downloads the WASM runtime and model files from CDN.
 */
export async function initHandLandmarker(): Promise<void> {
  if (handLandmarker) return;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 1,
    minHandDetectionConfidence: 0.7,
    minTrackingConfidence: 0.5,
  });
}

/**
 * Detect hand landmarks from a video element.
 * Returns the raw landmarks list (array of 21 NormalizedLandmark per hand).
 */
export function detectHands(
  videoElement: HTMLVideoElement
): NormalizedLandmark[][] {
  if (!handLandmarker) return [];

  const currentTime = videoElement.currentTime;
  // MediaPipe requires strictly increasing timestamps
  if (currentTime <= lastVideoTime) return [];
  lastVideoTime = currentTime;

  try {
    const result = handLandmarker.detectForVideo(videoElement, performance.now());
    return result.landmarks || [];
  } catch {
    return [];
  }
}

/**
 * Extract a 42-dimensional translation-invariant feature vector from landmarks.
 * Mirrors isl_dtw/utils.py extract_landmarks():
 *   - Subtracts wrist (landmark 0) x,y from all 21 landmarks
 *   - Returns Float32Array(42) or zeros if no hand detected
 */
export function extractFeatureVector(
  landmarks: NormalizedLandmark[][] | null
): Float32Array {
  const featureVector = new Float32Array(42);

  if (!landmarks || landmarks.length === 0) {
    return featureVector; // zero-padded
  }

  const primaryHand = landmarks[0];
  if (primaryHand.length < 21) return featureVector;

  const wristX = primaryHand[0].x;
  const wristY = primaryHand[0].y;

  for (let i = 0; i < 21; i++) {
    featureVector[i * 2] = primaryHand[i].x - wristX;
    featureVector[i * 2 + 1] = primaryHand[i].y - wristY;
  }

  return featureVector;
}

/**
 * Check if the feature vector is all zeros (no hand detected).
 */
export function isHandDetected(featureVector: Float32Array): boolean {
  for (let i = 0; i < featureVector.length; i++) {
    if (featureVector[i] !== 0) return true;
  }
  return false;
}

/**
 * Cleanup the HandLandmarker instance.
 */
export function closeHandLandmarker(): void {
  if (handLandmarker) {
    handLandmarker.close();
    handLandmarker = null;
    lastVideoTime = -1;
  }
}
