/**
 * dtwEngine.ts
 *
 * Async Proxy for the Dedicated DTW Web Worker.
 * Communicates via postMessage to completely offload O(n*r) DTW matrix math
 * from the main UI thread.
 */

import DtwWorker from './dtwWorker?worker';

export const STOP_GESTURE_NAME = "stop";
export const FEATURE_DIM = 106;

export interface MatchResult {
  gesture: string | null;
  distance: number;
  confidence: number;
  scores: Record<string, number>;
  bufferFill: number;
}

let worker: Worker | null = null;
let messageIdCounter = 0;
const pendingPromises: Record<number, { resolve: (val: any) => void, reject: (err: any) => void }> = {};

function initWorker() {
  if (!worker) {
    worker = new DtwWorker();
    worker.onmessage = (e) => {
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
  }
}

function postToWorker<T>(type: string, payload?: any): Promise<T> {
  initWorker();
  return new Promise((resolve, reject) => {
    const id = messageIdCounter++;
    pendingPromises[id] = { resolve, reject };
    // We intentionally omit Transferables here for the 424-byte featureVec
    // because structured cloning is practically instantaneous, and it prevents
    // "detached ArrayBuffer" bugs if the UI needs to access the vector in the same frame.
    worker!.postMessage({ id, type, payload });
  });
}

// ─── Proxy APIs ────────────────────────────────────────────────────────
let cachedTemplateNames: string[] = [];
let cachedBufferFill: number = 0;

export async function loadTemplates(apiBase: string = ""): Promise<string[]> {
  const names = await postToWorker<string[]>('LOAD_TEMPLATES', { apiBase });
  cachedTemplateNames = names;
  return names;
}

export function getTemplateCount(): number {
  return cachedTemplateNames.length;
}

export function getTemplateNames(): string[] {
  return cachedTemplateNames;
}

export function getBufferFill(): number {
  return cachedBufferFill;
}

export async function pushFrame(featureVector: Float32Array): Promise<number> {
  // Eagerly update to prevent UI lag while worker is busy
  if (cachedBufferFill < 90) cachedBufferFill++;
  
  const fill = await postToWorker<number>('PUSH_FRAME', featureVector);
  cachedBufferFill = fill; // Resync with true worker state
  return fill;
}

export async function clearBuffer(): Promise<void> {
  cachedBufferFill = 0;
  return postToWorker<void>('CLEAR_BUFFER');
}

export async function setThreshold(t: number): Promise<void> {
  return postToWorker<void>('SET_THRESHOLD', t);
}

export async function matchGesture(): Promise<MatchResult> {
  const match = await postToWorker<MatchResult>('MATCH_GESTURE');
  // Match clears buffer if successful (confidence >= 90)
  if (match.confidence >= 90) {
    cachedBufferFill = 0;
  }
  return match;
}

export function isStopGesture(name: string): boolean {
  return name.toLowerCase() === STOP_GESTURE_NAME;
}

// ─── Encoding ────────────────────────────────────────────────────────

export function encodeNpy(frames: Float32Array[]): Uint8Array {
  const numFrames = frames.length;
  const dictStr = `{'descr': '<f4', 'fortran_order': False, 'shape': (${numFrames}, 106), }`;
  
  // The total preamble length (10 bytes + header length) must be a multiple of 64.
  // Preamble: Magic (6) + Version (2) + HeaderLen (2) = 10 bytes.
  // Header: dictStr + padding spaces + '\n'.
  let pad = 64 - ((10 + dictStr.length + 1) % 64);
  if (pad === 64) pad = 0;
  
  const headerStr = dictStr + ' '.repeat(pad) + '\n';
  const headerLen = headerStr.length;
  
  const buffer = new ArrayBuffer(10 + headerLen + numFrames * FEATURE_DIM * 4);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);
  
  // Magic string: \x93NUMPY
  uint8.set([0x93, 78, 85, 77, 80, 89], 0);
  // Major/Minor version 1.0
  uint8.set([1, 0], 6);
  // Header length (little endian 16-bit)
  view.setUint16(8, headerLen, true);
  
  // Write header string
  for (let i = 0; i < headerLen; i++) {
    uint8[10 + i] = headerStr.charCodeAt(i);
  }
  
  // Write flat feature data (offset 10 + headerLen is now guaranteed multiple of 64)
  const floatArray = new Float32Array(buffer, 10 + headerLen);
  let offset = 0;
  for (const frame of frames) {
    floatArray.set(frame, offset);
    offset += FEATURE_DIM;
  }
  
  return uint8;
}
