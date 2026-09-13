/**
 * holisticLandmarker.ts
 *
 * Feature extraction & topological constants for MediaPipe Holistic.
 * Mirrors the feature extraction logic from isl_dtw/utils.py:
 *   - 106-dim feature vector per frame
 *   - Pose (upper body + head anchors) normalized to mid-shoulder
 *   - Left/Right hands normalized to respective wrists
 *   - Zero-padded when parts are missing
 *
 * Primary inference execution is offloaded to visionWorker.ts.
 * Fallback main-thread inference is provided in case the host device
 * has WebGL/OffscreenCanvas disabled in WorkerGlobalScope.
 */

import {
  PoseLandmarker,
  HandLandmarker,
  FilesetResolver,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import { Capacitor } from '@capacitor/core';

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

const MEDIAPIPE_WASM_VERSION = "0.10.21";

export function getWasmUrl(): string {
  const isCapacitorNative = Capacitor.isNativePlatform();

  if (isCapacitorNative) {
    return '/models/wasm';
  }
  const localWasm = '/models/wasm';
  const cdnWasm = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_WASM_VERSION}/wasm`;
  return import.meta.env.VITE_LOCAL_MODELS === 'true' ? localWasm : cdnWasm;
}

export function getModelUrl(filename: string): string {
  const isCapacitorNative = Capacitor.isNativePlatform();

  if (isCapacitorNative) {
    return `/models/${filename}`;
  }
  const localUrl = `/models/${filename}`;
  const cdnBase = 'https://storage.googleapis.com/mediapipe-models';
  const cdnPaths: Record<string, string> = {
    'pose_landmarker_lite.task': `${cdnBase}/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
    'pose_landmarker_full.task': `${cdnBase}/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`,
    'hand_landmarker.task': `${cdnBase}/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
  };
  return import.meta.env.VITE_LOCAL_MODELS === 'true' ? localUrl : (cdnPaths[filename] ?? localUrl);
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

  // 2. Right Hand (Physical Right Hand) -> Maps to Python's left_hand block
  if (result.rightHand && result.rightHand.length >= 21) {
    const wristX = 1.0 - result.rightHand[0].x;
    const wristY = result.rightHand[0].y;

    for (let i = 0; i < 21; i++) {
      featureVector[offset++] = (1.0 - result.rightHand[i].x) - wristX;
      featureVector[offset++] = result.rightHand[i].y - wristY;
    }
  } else {
    offset += 42; // skip
  }

  // 3. Left Hand (Physical Left Hand) -> Maps to Python's right_hand block
  if (result.leftHand && result.leftHand.length >= 21) {
    const wristX = 1.0 - result.leftHand[0].x;
    const wristY = result.leftHand[0].y;

    for (let i = 0; i < 21; i++) {
      featureVector[offset++] = (1.0 - result.leftHand[i].x) - wristX;
      featureVector[offset++] = result.leftHand[i].y - wristY;
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

// ─── Main Thread Fallback ──────────────────────────────────────────────
let mainPoseLandmarker: PoseLandmarker | null = null;
let mainHandLandmarker: HandLandmarker | null = null;
let mainLastTimestamp = 0;

export async function initMainThreadLandmarker(): Promise<void> {
  if (mainPoseLandmarker && mainHandLandmarker) return;
  console.log("[Holistic] Initializing main-thread fallback MediaPipe models...");
  const wasmUrl = getWasmUrl();
  const vision = await FilesetResolver.forVisionTasks(wasmUrl);
  const poseModel = getModelUrl('pose_landmarker_lite.task');
  const handModel = getModelUrl('hand_landmarker.task');

  try {
    [mainPoseLandmarker, mainHandLandmarker] = await Promise.all([
      PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: poseModel,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      }),
      HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: handModel,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      }),
    ]);
  } catch (gpuErr) {
    console.warn("[Holistic] Main-thread GPU delegate failed, falling back to CPU:", gpuErr);
    [mainPoseLandmarker, mainHandLandmarker] = await Promise.all([
      PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: poseModel,
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      }),
      HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: handModel,
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      }),
    ]);
  }
  console.log("[Holistic] Main-thread fallback models ready");
}

export function detectMainThread(video: HTMLVideoElement, timestamp: number): HolisticResult {
  const result: HolisticResult = { pose: null, leftHand: null, rightHand: null };
  if (!mainPoseLandmarker || !mainHandLandmarker) return result;

  let now = timestamp;
  if (now <= mainLastTimestamp) now = mainLastTimestamp + 1;
  mainLastTimestamp = now;

  try {
    const poseResult = mainPoseLandmarker.detectForVideo(video, now);
    if (poseResult.landmarks && poseResult.landmarks.length > 0) {
      result.pose = poseResult.landmarks[0];
    }
    const handResult = mainHandLandmarker.detectForVideo(video, now);
    if (handResult.landmarks && handResult.handednesses) {
      for (let i = 0; i < handResult.landmarks.length; i++) {
        const hand = handResult.landmarks[i];
        const category = handResult.handednesses[i]?.[0]?.categoryName;
        // Front-facing selfie camera: MediaPipe HandLandmarker assumes an unmirrored
        // input when predicting handedness, so the user's physical right hand is
        // reported as "Left", and physical left hand is reported as "Right".
        // Invert to map to the user's actual physical hands:
        if (category === "Left") {
          if (!result.rightHand) result.rightHand = hand;
          else if (!result.leftHand) result.leftHand = hand;
        } else if (category === "Right") {
          if (!result.leftHand) result.leftHand = hand;
          else if (!result.rightHand) result.rightHand = hand;
        } else {
          if (!result.rightHand) result.rightHand = hand;
          else if (!result.leftHand) result.leftHand = hand;
        }
      }
    }
  } catch (err) {
    console.warn("[MainThreadLandmarker] Frame dropped:", err);
  }
  return result;
}

export function closeMainThreadLandmarker(): void {
  if (mainPoseLandmarker) {
    mainPoseLandmarker.close();
    mainPoseLandmarker = null;
  }
  if (mainHandLandmarker) {
    mainHandLandmarker.close();
    mainHandLandmarker = null;
  }
  mainLastTimestamp = 0;
}
