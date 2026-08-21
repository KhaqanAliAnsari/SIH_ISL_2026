/**
 * dtwEngine.ts
 *
 * High-performance, zero-allocation browser-side DTW gesture recognition engine.
 * Mirrors the logic from isl_dtw/main.py:
 *   - Loads .npy template files via fetch
 *   - Rolling 90-frame ring buffer (O(1) push, zero-allocation dynamic window)
 *   - DTW with Sakoe-Chiba band constraint + Early Abandonment Pruning
 *   - Pre-allocated cost matrix to completely eliminate Garbage Collection (GC) pressure
 *   - Multi-template variation grouping (e.g. hello_01, hello_02 -> hello)
 *   - Threshold-gated recognition with duplicate suppression
 */

// ─── Constants ───────────────────────────────────────────────────────
const BUFFER_SIZE = 90;
const DEFAULT_THRESHOLD = 30.0;
const FEATURE_DIM = 106;
const SAKOE_CHIBA_RADIUS = 6; // Band constraint: only evaluate ±6 cells around diagonal
export const STOP_GESTURE_NAME = "stop";

// ─── Types ───────────────────────────────────────────────────────────
export interface GestureTemplate {
  name: string; // The class name (e.g., 'hello')
  sequence: Float32Array[]; // Array of N frames, each 106-dim
}

export interface MatchResult {
  gesture: string | null;
  distance: number;
  confidence: number; // 0-100, derived from distance
  scores: Record<string, number>; // all gesture distances
  bufferFill: number; // 0 to BUFFER_SIZE
}

// ─── State ───────────────────────────────────────────────────────────
let templates: GestureTemplate[] = [];
let threshold = DEFAULT_THRESHOLD;
let lastRecognitionTime = 0;
const COOLDOWN_MS = 1200; // 1.2s cooldown between consecutive gestures

// ─── Ring Buffer (O(1) push, zero-copy indexing) ─────────────────────
const ringBuffer: Float32Array[] = new Array(BUFFER_SIZE);
let ringHead = 0;   // Next write position
let ringCount = 0;  // How many frames are currently in buffer

// Pre-allocated array of frame pointers for dynamic window extraction
const windowFramesScratch: Float32Array[] = new Array(BUFFER_SIZE);

// ─── Pre-allocated DTW Cost Matrix ───────────────────────────────────
// Allocate once, reuse forever — eliminates heap allocations on every match
const MAX_SEQ_LEN = 128;
let dtwPrevRow = new Float64Array(MAX_SEQ_LEN + 1);
let dtwCurrRow = new Float64Array(MAX_SEQ_LEN + 1);

// ─── .npy Parser ─────────────────────────────────────────────────────
/**
 * Parse a NumPy .npy file (v1.0/v2.0 format) into an array of Float32Array frames.
 */
function parseNpy(buffer: ArrayBuffer): Float32Array[] {
  const view = new DataView(buffer);

  // Magic: \x93NUMPY
  const magic = String.fromCharCode(
    view.getUint8(0), view.getUint8(1), view.getUint8(2),
    view.getUint8(3), view.getUint8(4), view.getUint8(5)
  );
  if (magic !== "\x93NUMPY") {
    throw new Error("Not a valid .npy file");
  }

  const majorVersion = view.getUint8(6);
  let headerLen: number;
  let dataOffset: number;

  if (majorVersion === 1) {
    headerLen = view.getUint16(8, true);
    dataOffset = 10 + headerLen;
  } else {
    headerLen = view.getUint32(8, true);
    dataOffset = 12 + headerLen;
  }

  // Parse header string to extract shape
  const headerBytes = new Uint8Array(buffer, majorVersion === 1 ? 10 : 12, headerLen);
  const headerStr = new TextDecoder().decode(headerBytes);

  const shapeMatch = headerStr.match(/shape['"]\s*:\s*\(([^)]+)\)/);
  if (!shapeMatch) throw new Error("Could not parse shape from .npy header");

  const shapeParts = shapeMatch[1].split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const numRows = shapeParts[0] || 0;
  const numCols = shapeParts.length > 1 ? shapeParts[1] : FEATURE_DIM;

  if (numCols !== FEATURE_DIM) {
    throw new Error(`Expected ${FEATURE_DIM} features per frame, got ${numCols}`);
  }

  const floatData = new Float32Array(buffer, dataOffset);
  const frames: Float32Array[] = new Array(numRows);

  for (let i = 0; i < numRows; i++) {
    frames[i] = floatData.slice(i * FEATURE_DIM, (i + 1) * FEATURE_DIM);
  }

  return frames;
}

// ─── Squared Euclidean Distance (SIMD / Unroll friendly) ─────────────
/**
 * Unrolled loop for 106-dim feature vectors.
 * Avoids Math.sqrt inside the inner DTW loop.
 */
function euclideanDistanceSq(a: Float32Array, b: Float32Array): number {
  let sum0 = 0, sum1 = 0, sum2 = 0, sum3 = 0;
  const len = a.length;
  const blockEnd = len - (len % 4);

  let i = 0;
  for (; i < blockEnd; i += 4) {
    const d0 = a[i]     - b[i];
    const d1 = a[i + 1] - b[i + 1];
    const d2 = a[i + 2] - b[i + 2];
    const d3 = a[i + 3] - b[i + 3];
    sum0 += d0 * d0;
    sum1 += d1 * d1;
    sum2 += d2 * d2;
    sum3 += d3 * d3;
  }

  for (; i < len; i++) {
    const d = a[i] - b[i];
    sum0 += d * d;
  }

  return sum0 + sum1 + sum2 + sum3;
}

// ─── DTW with Sakoe-Chiba Band Constraint & Early Exit ───────────────
/**
 * Computes DTW distance with Sakoe-Chiba band constraint + early exit pruning.
 * O(N * radius) complexity instead of O(N * M).
 * Uses pre-allocated static Float64Arrays (Zero GC allocation).
 */
function dtwDistance(
  seq1: Float32Array[],
  n: number,
  seq2: Float32Array[],
  m: number,
  earlyExitThresholdSq: number = Infinity
): number {
  const r = SAKOE_CHIBA_RADIUS;

  // Ensure pre-allocated scratch arrays are sufficient
  if (dtwPrevRow.length < m + 1) {
    dtwPrevRow = new Float64Array(m + 1);
    dtwCurrRow = new Float64Array(m + 1);
  }

  dtwPrevRow.fill(Infinity, 0, m + 1);
  dtwPrevRow[0] = 0;

  for (let i = 1; i <= n; i++) {
    dtwCurrRow.fill(Infinity, 0, m + 1);

    const jStart = Math.max(1, i - r);
    const jEnd = Math.min(m, i + r);

    let rowMinCost = Infinity;

    for (let j = jStart; j <= jEnd; j++) {
      const cost = euclideanDistanceSq(seq1[i - 1], seq2[j - 1]);
      const minPrev = Math.min(
        dtwPrevRow[j],     // insertion
        dtwCurrRow[j - 1], // deletion
        dtwPrevRow[j - 1]  // match
      );
      const totalCost = cost + minPrev;
      dtwCurrRow[j] = totalCost;
      if (totalCost < rowMinCost) {
        rowMinCost = totalCost;
      }
    }

    // Early exit: if the minimum possible cost in this entire row exceeds our threshold, prune!
    if (rowMinCost > earlyExitThresholdSq) {
      return Infinity;
    }

    // Swap row pointers (zero-copy)
    const tmp = dtwPrevRow;
    dtwPrevRow = dtwCurrRow;
    dtwCurrRow = tmp;
  }

  return Math.sqrt(dtwPrevRow[m]);
}

// ─── Public API ──────────────────────────────────────────────────────

export function isStopGesture(name: string): boolean {
  return name.toLowerCase() === STOP_GESTURE_NAME;
}

/**
 * Load gesture templates from the server API.
 */
export async function loadTemplates(
  apiBase: string = ""
): Promise<GestureTemplate[]> {
  try {
    const listRes = await fetch(`${apiBase}/api/templates`);
    if (!listRes.ok) {
      console.warn("[DTW] Failed to fetch template list:", listRes.status);
      return [];
    }

    const fileList: string[] = await listRes.json();
    const loaded: GestureTemplate[] = [];

    // Parallel fetch for fast initialization
    const fetchPromises = fileList.map(async (filename) => {
      try {
        const res = await fetch(`${apiBase}/api/templates/${filename}`);
        if (!res.ok) return null;

        const arrayBuffer = await res.arrayBuffer();
        const frames = parseNpy(arrayBuffer);

        // Strip "reference_" prefix, ".npy" suffix, and variation numbers ("_01", "_02")
        const name = filename
          .replace(/^reference_/, "")
          .replace(/\.npy$/, "")
          .replace(/_\d{1,2}$/, "");

        console.log(`[DTW] Loaded template '${name}' (${frames.length} frames)`);
        return { name, sequence: frames } as GestureTemplate;
      } catch (err) {
        console.warn(`[DTW] Failed to load template '${filename}':`, err);
        return null;
      }
    });

    const results = await Promise.all(fetchPromises);
    for (const t of results) {
      if (t) loaded.push(t);
    }

    templates = loaded;
    return loaded;
  } catch (err) {
    console.warn("[DTW] Template loading failed:", err);
    return [];
  }
}

/**
 * Push a feature vector frame into the rolling ring buffer in O(1) time.
 */
export function pushFrame(featureVector: Float32Array): void {
  ringBuffer[ringHead] = featureVector;
  ringHead = (ringHead + 1) % BUFFER_SIZE;
  if (ringCount < BUFFER_SIZE) {
    ringCount++;
  }
}

/**
 * Clear the frame buffer after recognition to prevent immediate duplicate triggers.
 */
export function clearBuffer(): void {
  ringHead = 0;
  ringCount = 0;
}

export function getBufferFill(): number {
  return ringCount;
}

export function setThreshold(t: number): void {
  threshold = t;
}

export function getThreshold(): number {
  return threshold;
}

export function getTemplateCount(): number {
  return templates.length;
}

export function getTemplateNames(): string[] {
  return Array.from(new Set(templates.map(t => t.name)));
}

/**
 * Fill scratch window array with the most recent `len` frames in chronological order.
 * Zero-allocation snapshot.
 */
function fillRecentFrames(len: number): Float32Array[] {
  // Most recent frame is at (ringHead - 1 + BUFFER_SIZE) % BUFFER_SIZE
  // Oldest of the `len` frames is at (ringHead - len + BUFFER_SIZE) % BUFFER_SIZE
  const startIdx = (ringHead - len + BUFFER_SIZE) % BUFFER_SIZE;
  for (let i = 0; i < len; i++) {
    windowFramesScratch[i] = ringBuffer[(startIdx + i) % BUFFER_SIZE];
  }
  return windowFramesScratch;
}

/**
 * High-speed, zero-allocation gesture matching against all loaded templates.
 */
export function matchGesture(): MatchResult {
  const result: MatchResult = {
    gesture: null,
    distance: Infinity,
    confidence: 0,
    scores: {},
    bufferFill: ringCount,
  };

  // Need at least 10 frames and at least one template
  if (ringCount < 10 || templates.length === 0) {
    return result;
  }

  // Cooldown gate
  const now = Date.now();
  if (now - lastRecognitionTime < COOLDOWN_MS) {
    return result;
  }

  let bestGesture: string | null = null;
  let minDistance = Infinity;
  const classScores: Record<string, number> = {};

  for (let t = 0; t < templates.length; t++) {
    const template = templates[t];
    const t_len = template.sequence.length;

    // Only evaluate if buffer has enough frames for this template's duration
    if (ringCount >= t_len) {
      // Zero-allocation dynamic window slice
      const windowSeq = fillRecentFrames(t_len);

      // Convert threshold to squared equivalent for early pruning
      const earlyExitSq = (threshold * threshold * t_len) / 30.0;

      const rawDist = dtwDistance(
        windowSeq,
        t_len,
        template.sequence,
        t_len,
        earlyExitSq
      );

      if (rawDist !== Infinity) {
        // Normalize distance back to 30-frame scale: (dist / t_len) * 30.0
        const normalizedDist = (rawDist / t_len) * 30.0;

        if (!(template.name in classScores) || normalizedDist < classScores[template.name]) {
          classScores[template.name] = normalizedDist;
        }
      }
    }
  }

  // Find class with lowest distance
  for (const [className, dist] of Object.entries(classScores)) {
    result.scores[className] = Math.round(dist * 100) / 100;
    if (dist < minDistance) {
      minDistance = dist;
      bestGesture = className;
    }
  }

  result.distance = minDistance;

  // Threshold check
  if (bestGesture !== null && minDistance < threshold) {
    const calculatedConfidence = Math.max(
      0,
      Math.min(100, Math.round(100 - (minDistance / threshold) * 50))
    );

    // Enforce 90% confidence minimum
    if (calculatedConfidence >= 90) {
      result.gesture = bestGesture;
      result.confidence = calculatedConfidence;

      // Clear buffer on recognition
      clearBuffer();
      lastRecognitionTime = now;

      console.log(
        `[DTW] RECOGNIZED: '${bestGesture}' | Distance: ${minDistance.toFixed(2)} | Confidence: ${result.confidence}%`
      );
    }
  }

  return result;
}
