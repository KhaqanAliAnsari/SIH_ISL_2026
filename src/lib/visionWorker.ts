/**
 * visionWorker.ts
 *
 * Dedicated Web Worker for MediaPipe Holistic Inference.
 * Offloads PoseLandmarker and HandLandmarker models off the main UI thread.
 *
 * Key Optimizations:
 * 1. Zero-copy input frame transfer via ImageBitmap.
 * 2. GPU acceleration via OffscreenCanvas / WebGL with automatic graceful CPU fallback.
 * 3. Rate decoupling: Pose runs at ~10 FPS (every 3rd frame) while Hands run at ~30 FPS.
 * 4. 1x1 warmup dummy frame on init to eliminate first-frame latency spikes.
 * 5. Immediate resource cleanup via bitmap.close() after each inference pass.
 * 6. Transferable Float32Array feature vector back to main thread.
 * 7. Polyfills for WorkerGlobalScope to satisfy MediaPipe DOM expectations.
 */

// Polyfill document in Web Worker scope to prevent MediaPipe internal crashes:
// (MediaPipe internally falls back to document.createElement("canvas") if OffscreenCanvas is unverified)
if (typeof (self as any).document === 'undefined') {
  (self as any).document = {
    createElement: (tag: string) => {
      if (tag === 'canvas' && typeof OffscreenCanvas !== 'undefined') {
        return new OffscreenCanvas(1, 1);
      }
      return {
        getContext: () => null,
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
      };
    },
    body: {
      appendChild: () => {},
      removeChild: () => {},
    },
  };
}

import {
  HandLandmarker,
  PoseLandmarker,
  FilesetResolver,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import {
  extractHolisticFeatureVector,
  type HolisticResult,
} from "./holisticLandmarker";

let poseLandmarker: PoseLandmarker | null = null;
let handLandmarker: HandLandmarker | null = null;
let lastTimestamp = 0;
let lastPoseLandmarks: NormalizedLandmark[] | null = null;
let poseFrameCounter = 0;

self.onmessage = async (e: MessageEvent) => {
  const { id, type, payload } = e.data;

  try {
    switch (type) {
      case 'INIT': {
        const { wasmUrl, poseModelUrl, handModelUrl } = payload;
        const t0 = performance.now();

        console.log(`[VisionWorker] Initializing FilesetResolver with wasmUrl: ${wasmUrl}`);
        // CRITICAL: useModule = true is required for ES module Web Workers,
        // otherwise MediaPipe attempts importScripts() which throws TypeError in ES module workers
        const vision = await FilesetResolver.forVisionTasks(wasmUrl, true);
        let activeDelegate: 'GPU' | 'CPU' = 'GPU';

        const canvasOption = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(1, 1) : undefined;

        try {
          // Attempt GPU delegate first
          [poseLandmarker, handLandmarker] = await Promise.all([
            PoseLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: poseModelUrl,
                delegate: "GPU",
              },
              runningMode: "VIDEO",
              numPoses: 1,
              minPoseDetectionConfidence: 0.5,
              minPosePresenceConfidence: 0.5,
              minTrackingConfidence: 0.5,
              ...(canvasOption ? { canvas: canvasOption as any } : {}),
            }),
            HandLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: handModelUrl,
                delegate: "GPU",
              },
              runningMode: "VIDEO",
              numHands: 2,
              minHandDetectionConfidence: 0.5,
              minTrackingConfidence: 0.5,
              ...(canvasOption ? { canvas: canvasOption as any } : {}),
            }),
          ]);
        } catch (gpuError) {
          console.warn("[VisionWorker] GPU initialization failed; falling back to CPU:", gpuError);
          activeDelegate = 'CPU';
          [poseLandmarker, handLandmarker] = await Promise.all([
            PoseLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: poseModelUrl,
                delegate: "CPU",
              },
              runningMode: "VIDEO",
              numPoses: 1,
              minPoseDetectionConfidence: 0.5,
              minPosePresenceConfidence: 0.5,
              minTrackingConfidence: 0.5,
              ...(canvasOption ? { canvas: canvasOption as any } : {}),
            }),
            HandLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: handModelUrl,
                delegate: "CPU",
              },
              runningMode: "VIDEO",
              numHands: 2,
              minHandDetectionConfidence: 0.5,
              minTrackingConfidence: 0.5,
              ...(canvasOption ? { canvas: canvasOption as any } : {}),
            }),
          ]);
        }

        // Warmup dummy frame to compile shaders / WASM JIT pipelines
        try {
          if (typeof OffscreenCanvas !== 'undefined') {
            const dummy = new OffscreenCanvas(1, 1);
            const ctx = dummy.getContext('2d');
            if (ctx) {
              ctx.fillRect(0, 0, 1, 1);
              poseLandmarker.detectForVideo(dummy as any, 1);
              handLandmarker.detectForVideo(dummy as any, 1);
            }
          }
        } catch (warmupErr) {
          // Warmup is non-critical
          console.log("[VisionWorker] Model warmup skipped:", warmupErr);
        }

        const t1 = performance.now();
        console.log(`[VisionWorker] Models initialized (${activeDelegate}) in ${(t1 - t0).toFixed(0)}ms`);

        (self as any).postMessage({
          id,
          type: 'INIT_OK',
          payload: { delegate: activeDelegate },
        });
        break;
      }

      case 'DETECT_FRAME': {
        const { bitmap, timestamp } = payload as { bitmap: ImageBitmap; timestamp: number };

        if (!poseLandmarker || !handLandmarker) {
          bitmap.close();
          throw new Error("Models not initialized");
        }

        try {
          let now = timestamp;
          if (now <= lastTimestamp) {
            now = lastTimestamp + 1;
          }
          lastTimestamp = now;

          // Pose detection on every frame to match template recording conditions.
          // Templates were recorded with holistic.process() on every frame, so
          // running pose at 10 FPS (every 3rd frame) introduced stale-landmark noise
          // into the feature vector, degrading DTW match accuracy.
          // Trade-off: ~3× more pose GPU work, but critical for recognition quality.
          const poseResult = poseLandmarker.detectForVideo(bitmap as any, now);
          if (poseResult.landmarks && poseResult.landmarks.length > 0) {
            lastPoseLandmarks = poseResult.landmarks[0];
          } else {
            lastPoseLandmarks = null;
          }

          // Hands run on every frame (~30 FPS) for responsive fingerspelling & motion
          const handResult = handLandmarker.detectForVideo(bitmap as any, now);

          let leftHand: NormalizedLandmark[] | null = null;
          let rightHand: NormalizedLandmark[] | null = null;

          if (handResult.landmarks && handResult.handednesses) {
            for (let i = 0; i < handResult.landmarks.length; i++) {
              const hand = handResult.landmarks[i];
              const category = handResult.handednesses[i]?.[0]?.categoryName;
              // Front-facing selfie camera: MediaPipe HandLandmarker assumes an unmirrored
              // input when predicting handedness, so the user's physical right hand is
              // reported as "Left", and physical left hand is reported as "Right".
              // Invert to map to the user's actual physical hands:
              if (category === "Left") {
                if (!leftHand) leftHand = hand;
                else if (!rightHand) rightHand = hand;
              } else if (category === "Right") {
                if (!rightHand) rightHand = hand;
                else if (!leftHand) leftHand = hand;
              } else {
                if (!rightHand) rightHand = hand;
                else if (!leftHand) leftHand = hand;
              }
            }
          }

          const result: HolisticResult = {
            pose: lastPoseLandmarks,
            leftHand,
            rightHand,
          };

          const featureVec = extractHolisticFeatureVector(result);

          // Immediately free the transferred ImageBitmap GPU texture
          bitmap.close();

          // Transfer featureVec.buffer for zero-copy transmission back
          (self as any).postMessage(
            {
              id,
              type: 'FRAME_RESULT',
              payload: {
                result,
                featureVec,
              },
            },
            [featureVec.buffer]
          );
        } catch (detectErr) {
          bitmap.close();
          throw detectErr;
        }
        break;
      }

      case 'CLOSE': {
        if (poseLandmarker) {
          poseLandmarker.close();
          poseLandmarker = null;
        }
        if (handLandmarker) {
          handLandmarker.close();
          handLandmarker = null;
        }
        lastTimestamp = 0;
        lastPoseLandmarks = null;
        poseFrameCounter = 0;

        (self as any).postMessage({ id, type: 'CLOSE_OK' });
        break;
      }

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (err: any) {
    console.error("[VisionWorker] Fatal error in worker:", err);
    (self as any).postMessage({
      id,
      type: 'ERROR',
      payload: err?.stack || err?.message || String(err),
    });
  }
};
