/**
 * holisticLandmarker.ts
 *
 * Direct GPU-Accelerated Browser Implementation of MediaPipe Holistic.
 * Mirrors the feature extraction logic from isl_dtw/utils.py:
 *   - 106-dim feature vector per frame
 *   - Pose (upper body + head anchors) normalized to mid-shoulder
 *   - Left/Right hands normalized to respective wrists
 *   - Zero-padded when parts are missing
 *   - Unrestricted 1:1 real-time GPU inference (0ms anchor latency)
 */

import {
  HandLandmarker,
  PoseLandmarker,
  FilesetResolver,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

let poseLandmarker: PoseLandmarker | null = null;
let handLandmarker: HandLandmarker | null = null;
let lastTimestamp = 0;

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

/**
 * Prefer bundled local WASM (APK / offline) → CDN fallback for dev/browser.
 * Local path resolves from public/models/wasm/ which is served at /models/wasm/.
 * Run `node scripts/bundle-models.mjs` once to populate public/models/.
 */
import { Capacitor } from '@capacitor/core';

function getWasmUrl(): string {
  const isCapacitorNative = Capacitor.isNativePlatform();

  if (isCapacitorNative) {
    return '/models/wasm';
  }
  // In browser/dev: use local if available (detected at build time via VITE env),
  // otherwise fall back to CDN.
  const localWasm = '/models/wasm';
  const cdnWasm = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_WASM_VERSION}/wasm`;
  // Use local path if the bundle-models script has been run (public/models/wasm/ exists)
  return import.meta.env.VITE_LOCAL_MODELS === 'true' ? localWasm : cdnWasm;
}

function getModelUrl(filename: string): string {
  // @ts-ignore
  const isCapacitorNative = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNative;

  if (isCapacitorNative) {
    return `/models/${filename}`;
  }
  const localUrl = `/models/${filename}`;
  const cdnBase = 'https://storage.googleapis.com/mediapipe-models';
  const cdnPaths: Record<string, string> = {
    'pose_landmarker_full.task': `${cdnBase}/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`,
    'hand_landmarker.task': `${cdnBase}/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
  };
  return import.meta.env.VITE_LOCAL_MODELS === 'true' ? localUrl : (cdnPaths[filename] ?? localUrl);
}

const MEDIAPIPE_WASM_URL = getWasmUrl();

/**
 * Initialize the PoseLandmarker and HandLandmarker models on GPU.
 */
export async function initHolisticLandmarker(): Promise<void> {
  if (poseLandmarker && handLandmarker) return;

  const t0 = performance.now();
  console.log("[Holistic] Initializing GPU-accelerated MediaPipe models...");

  const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);

  const [pose, hand] = await Promise.all([
    PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: getModelUrl('pose_landmarker_full.task'),
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
        modelAssetPath: getModelUrl('hand_landmarker.task'),
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    }),
  ]);

  poseLandmarker = pose;
  handLandmarker = hand;

  const t1 = performance.now();
  console.log(`[Holistic] Models ready on GPU in ${(t1 - t0).toFixed(0)}ms`);
}

/**
 * Detect pose and hands from a video element at full real-time speed.
 * Processes every single frame with 0ms latency.
 */
export function detectHolistic(videoElement: HTMLVideoElement, timestamp: number): HolisticResult {
  const result: HolisticResult = {
    pose: null,
    leftHand: null,
    rightHand: null,
  };

  if (!poseLandmarker || !handLandmarker) return result;

  try {
    let now = timestamp;
    if (now <= lastTimestamp) {
      now = lastTimestamp + 1;
    }
    lastTimestamp = now;

    // Run both pose and hand detection synchronously on GPU
    const poseResult = poseLandmarker.detectForVideo(videoElement, now);
    const handResult = handLandmarker.detectForVideo(videoElement, now);

    if (poseResult.landmarks && poseResult.landmarks.length > 0) {
      result.pose = poseResult.landmarks[0];
    }

    if (handResult.landmarks && handResult.handednesses) {
      for (let i = 0; i < handResult.landmarks.length; i++) {
        const hand = handResult.landmarks[i];
        const category = handResult.handednesses[i][0].categoryName;
        if (category === "Left" && !result.leftHand) {
          result.leftHand = hand;
        } else if (category === "Right" && !result.rightHand) {
          result.rightHand = hand;
        }
      }
    }

    return result;
  } catch (err) {
    console.warn("[Holistic] Detection frame dropped:", err);
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
  lastTimestamp = 0;
}
