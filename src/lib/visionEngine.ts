/**
 * visionEngine.ts
 *
 * Async Proxy for the Dedicated Vision Web Worker.
 * Offloads all MediaPipe inference from the main UI thread.
 */

import VisionWorker from './visionWorker?worker';
import {
  getWasmUrl,
  getModelUrl,
  type HolisticResult,
} from './holisticLandmarker';

export interface VisionResult {
  result: HolisticResult;
  featureVec: Float32Array;
}

let worker: Worker | null = null;
let messageIdCounter = 0;
const pendingPromises: Record<number, { resolve: (val: any) => void; reject: (err: any) => void }> = {};
let isInitializing = false;
let isReady = false;

function ensureWorker(): Worker {
  if (!worker) {
    worker = new VisionWorker();
    worker.onmessage = (e: MessageEvent) => {
      const { id, type, payload } = e.data;
      if (pendingPromises[id]) {
        if (type === 'ERROR') {
          pendingPromises[id].reject(new Error(payload));
        } else {
          pendingPromises[id].resolve(payload);
        }
        delete pendingPromises[id];
      }
    };
    worker.onerror = (err) => {
      console.error('[VisionEngine] Worker uncaught error:', err);
      // Reject any pending promises on worker crash
      for (const id in pendingPromises) {
        pendingPromises[id].reject(err);
        delete pendingPromises[id];
      }
      isReady = false;
    };
  }
  return worker;
}

function postToWorker<T>(type: string, payload?: any, transferList?: Transferable[]): Promise<T> {
  const w = ensureWorker();
  return new Promise((resolve, reject) => {
    const id = messageIdCounter++;
    pendingPromises[id] = { resolve, reject };
    if (transferList && transferList.length > 0) {
      w.postMessage({ id, type, payload }, transferList);
    } else {
      w.postMessage({ id, type, payload });
    }
  });
}

/**
 * Initialize the Vision Worker with MediaPipe WASM and model files.
 */
export async function initVisionWorker(): Promise<{ delegate: string }> {
  if (isReady) return { delegate: 'GPU' };
  if (isInitializing) {
    // Wait for in-flight init if multiple calls occur
    return new Promise((resolve, reject) => {
      const check = setInterval(() => {
        if (isReady) {
          clearInterval(check);
          resolve({ delegate: 'GPU' });
        }
      }, 50);
      setTimeout(() => {
        clearInterval(check);
        if (!isReady) reject(new Error("Vision worker init timed out"));
      }, 10000);
    });
  }

  isInitializing = true;
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    let wasmUrl = getWasmUrl();
    let poseModelUrl = getModelUrl('pose_landmarker_lite.task');
    let handModelUrl = getModelUrl('hand_landmarker.task');

    if (origin && wasmUrl.startsWith('/')) wasmUrl = `${origin}${wasmUrl}`;
    if (origin && poseModelUrl.startsWith('/')) poseModelUrl = `${origin}${poseModelUrl}`;
    if (origin && handModelUrl.startsWith('/')) handModelUrl = `${origin}${handModelUrl}`;

    const res = await postToWorker<{ delegate: string }>('INIT', {
      wasmUrl,
      poseModelUrl,
      handModelUrl,
    });

    isReady = true;
    return res;
  } finally {
    isInitializing = false;
  }
}

/**
 * Detect pose and hands from a transferred ImageBitmap.
 * Transfers the ImageBitmap to the worker thread (zero-copy).
 */
export function detectFrame(bitmap: ImageBitmap, timestamp: number): Promise<VisionResult> {
  if (!isReady && !isInitializing) {
    bitmap.close();
    return Promise.reject(new Error("Vision worker is not initialized"));
  }

  return postToWorker<VisionResult>(
    'DETECT_FRAME',
    { bitmap, timestamp },
    [bitmap]
  );
}

/**
 * Clean up the worker and terminate its background thread.
 */
export async function closeVisionWorker(): Promise<void> {
  if (worker) {
    try {
      await postToWorker('CLOSE');
    } catch (e) {
      // Ignore errors on close
    }
    worker.terminate();
    worker = null;
  }
  isReady = false;
  isInitializing = false;
  for (const id in pendingPromises) {
    delete pendingPromises[id];
  }
}
