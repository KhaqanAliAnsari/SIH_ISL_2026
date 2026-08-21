/**
 * dtwEngine.ts
 *
 * High-performance browser-side DTW (Dynamic Time Warping) gesture recognition engine.
 * Mirrors the logic from isl_dtw/main.py:
 *   - Loads .npy template files via fetch
 *   - Rolling 90-frame ring buffer (O(1) push, zero-copy snapshot)
 *   - Multi-template class matching for natural variations
 *   - Dynamic-length slicing (variable window lengths)
 *   - DTW with Sakoe-Chiba band constraint for O(n*r) complexity
 *   - Pre-allocated cost matrix to eliminate GC pressure
 *   - Threshold-gated recognition with duplicate suppression
 */

// ─── Constants ───────────────────────────────────────────────────────
const BUFFER_SIZE = 90; // 3 seconds at 30 fps
const DEFAULT_THRESHOLD = 30.0;
const FEATURE_DIM = 106;
const SAKOE_CHIBA_RADIUS = 5; // Band constraint: only check ±5 from diagonal
export const STOP_GESTURE_NAME = "stop";

// ─── Types ───────────────────────────────────────────────────────────
export interface GestureVariation {
  filename: string;
  sequence: Float32Array[];
}

export interface GestureTemplateClass {
  name: string;
  variations: GestureVariation[];
}

export interface MatchResult {
  gesture: string | null;
  distance: number;
  confidence: number; // 0-100, derived from distance
  scores: Record<string, number>; // all gesture distances
  bufferFill: number; // 0 to BUFFER_SIZE
}

// ─── State ───────────────────────────────────────────────────────────
let templateClasses: Record<string, GestureTemplateClass> = {};
let threshold = DEFAULT_THRESHOLD;
let lastRecognitionTime = 0;
const COOLDOWN_MS = 1200; // reduced from 2s for faster fingerspelling sequences

// ─── Ring Buffer (O(1) push, no shift/copy) ──────────────────────────
const ringBuffer: Float32Array[] = new Array(BUFFER_SIZE);
let ringHead = 0;   // Next write position
let ringCount = 0;  // How many frames are actually stored

// ─── Pre-allocated DTW Cost Matrix ───────────────────────────────────
// Allocate once, reuse forever — eliminates GC pressure on every match
const MAX_SEQ_LEN = BUFFER_SIZE + 1;
let dtwPrevRow = new Float64Array(MAX_SEQ_LEN + 1);
let dtwCurrRow = new Float64Array(MAX_SEQ_LEN + 1);

// ─── Pre-allocated Euclidean Distance Scratch ────────────────────────
// Avoid per-call stack allocations
const euclidScratch = new Float64Array(FEATURE_DIM);

// ─── .npy Parser ─────────────────────────────────────────────────────
/**
 * Parse a NumPy .npy file (v1.0 format) into a typed array.
 * Supports float32 (dtype '<f4') with shape (N, 106).
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

  // Header length (v1.0: 2 bytes at offset 8, v2.0: 4 bytes)
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

  // Extract shape tuple from header, e.g. "'shape': (30, 106)"
  const shapeMatch = headerStr.match(/shape['"]\s*:\s*\(([^)]+)\)/);
  if (!shapeMatch) throw new Error("Could not parse shape from .npy header");

  const shapeParts = shapeMatch[1].split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const numRows = shapeParts[0] || 0;
  const numCols = shapeParts.length > 1 ? shapeParts[1] : FEATURE_DIM;

  if (numCols !== FEATURE_DIM) {
    throw new Error(`Expected ${FEATURE_DIM} features per frame, got ${numCols}`);
  }

  // Read float32 data — use subarray for zero-copy slicing where possible
  const floatData = new Float32Array(buffer, dataOffset);
  const frames: Float32Array[] = new Array(numRows);

  for (let i = 0; i < numRows; i++) {
    // slice() creates a copy which is what we want for independent frames
    frames[i] = floatData.slice(i * FEATURE_DIM, (i + 1) * FEATURE_DIM);
  }

  return frames;
}

// ─── Euclidean Distance (SIMD-friendly, loop-unroll-friendly) ────────
/**
 * Squared Euclidean distance — avoids the sqrt for DTW cost comparisons.
 * DTW only needs relative ordering, so squared distance preserves correctness
 * while eliminating the expensive sqrt call per cell.
 * 
 * Final distance is sqrt'd once at the end.
 */
function euclideanDistanceSq(a: Float32Array, b: Float32Array): number {
  let sum0 = 0, sum1 = 0, sum2 = 0, sum3 = 0;
  const len = a.length;
  const blockEnd = len - (len % 4);

  // Process 4 elements at a time (helps V8 auto-vectorize)
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

  // Handle remainder
  for (; i < len; i++) {
    const d = a[i] - b[i];
    sum0 += d * d;
  }

  return sum0 + sum1 + sum2 + sum3;
}

// ─── DTW with Sakoe-Chiba Band Constraint ────────────────────────────
/**
 * DTW with Sakoe-Chiba band constraint.
 * Instead of filling the full n×m matrix (O(n*m)), only fills
 * a band of width 2*radius+1 around the diagonal (O(n*r)).
 * 
 * Uses pre-allocated Float64Arrays to avoid GC pressure.
 */
function dtwDistance(seq1: Float32Array[], seq2: Float32Array[]): number {
  const n = seq1.length;
  const m = seq2.length;
  const r = SAKOE_CHIBA_RADIUS;

  // Ensure pre-allocated arrays are large enough
  if (dtwPrevRow.length < m + 1) {
    dtwPrevRow = new Float64Array(m + 1);
    dtwCurrRow = new Float64Array(m + 1);
  }

  // Initialize previous row
  dtwPrevRow.fill(Infinity, 0, m + 1);
  dtwPrevRow[0] = 0;

  for (let i = 1; i <= n; i++) {
    dtwCurrRow.fill(Infinity, 0, m + 1);

    // Band constraint: only compute within [max(1, i-r), min(m, i+r)]
    const jStart = Math.max(1, i - r);
    const jEnd = Math.min(m, i + r);

    for (let j = jStart; j <= jEnd; j++) {
      const cost = euclideanDistanceSq(seq1[i - 1], seq2[j - 1]);
      dtwCurrRow[j] = cost + Math.min(
        dtwPrevRow[j],     // insertion
        dtwCurrRow[j - 1], // deletion
        dtwPrevRow[j - 1]  // match
      );
    }

    // Swap rows (pointer swap, no copy)
    const tmp = dtwPrevRow;
    dtwPrevRow = dtwCurrRow;
    dtwCurrRow = tmp;
  }

  // Return actual Euclidean distance (sqrt of accumulated squared distances)
  return Math.sqrt(dtwPrevRow[m]);
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Check if a gesture name is the sentence-terminating STOP sign.
 */
export function isStopGesture(name: string): boolean {
  return name.toLowerCase() === STOP_GESTURE_NAME;
}

/**
 * Load gesture templates from the server API.
 * Fetches the template list, then downloads and parses each .npy file.
 * Automatically groups variations (e.g. `reference_namaste_01.npy`) into their base class (`namaste`).
 */
export async function loadTemplates(
  apiBase: string = ""
): Promise<string[]> {
  try {
    const listRes = await fetch(`${apiBase}/api/templates`);
    if (!listRes.ok) {
      console.warn("[DTW] Failed to fetch template list:", listRes.status);
      return [];
    }

    const fileList: string[] = await listRes.json();
    const loadedClasses: Record<string, GestureTemplateClass> = {};

    // Parallel fetch for faster loading
    const fetchPromises = fileList.map(async (filename) => {
      try {
        const res = await fetch(`${apiBase}/api/templates/${filename}`);
        if (!res.ok) return null;

        const arrayBuffer = await res.arrayBuffer();
        const frames = parseNpy(arrayBuffer);

        // Extract gesture name: "reference_hello_01.npy" → "hello"
        let name = filename.replace(/^reference_/, "").replace(/\.npy$/, "");
        const match = name.match(/^(.+?)_\d+$/);
        if (match) {
          name = match[1];
        }

        console.log(`[DTW] Loaded template variation '${filename}' for class '${name}' (${frames.length} frames)`);
        
        return { className: name, variation: { filename, sequence: frames } };
      } catch (err) {
        console.warn(`[DTW] Failed to load template '${filename}':`, err);
        return null;
      }
    });

    const results = await Promise.all(fetchPromises);
    for (const res of results) {
      if (res) {
        if (!loadedClasses[res.className]) {
          loadedClasses[res.className] = { name: res.className, variations: [] };
        }
        loadedClasses[res.className].variations.push(res.variation);
      }
    }

    templateClasses = loadedClasses;
    return Object.keys(templateClasses);
  } catch (err) {
    console.warn("[DTW] Template loading failed:", err);
    return [];
  }
}

/**
 * Push a feature vector frame into the rolling ring buffer.
 * O(1) operation — no array shift or copy.
 */
export function pushFrame(featureVector: Float32Array): void {
  ringBuffer[ringHead] = featureVector;
  ringHead = (ringHead + 1) % BUFFER_SIZE;
  if (ringCount < BUFFER_SIZE) {
    ringCount++;
  }
}

/**
 * Clear the frame buffer (called after recognition to prevent duplicates).
 */
export function clearBuffer(): void {
  ringHead = 0;
  ringCount = 0;
}

/**
 * Get current buffer fill level.
 */
export function getBufferFill(): number {
  return ringCount;
}

/**
 * Set the DTW distance threshold.
 */
export function setThreshold(t: number): void {
  threshold = t;
}

/**
 * Get the current threshold.
 */
export function getThreshold(): number {
  return threshold;
}

/**
 * Get the number of loaded template classes.
 */
export function getTemplateCount(): number {
  return Object.keys(templateClasses).length;
}

/**
 * Get loaded template class names.
 */
export function getTemplateNames(): string[] {
  return Object.keys(templateClasses);
}

/**
 * Get an ordered snapshot of the ring buffer WITHOUT copying the underlying data.
 * Returns references to the Float32Array frames in chronological order.
 */
function getRingBufferSnapshot(): Float32Array[] {
  if (ringCount < BUFFER_SIZE) {
    // Buffer not yet full — frames are 0..ringHead-1 in order
    const snapshot: Float32Array[] = new Array(ringCount);
    for (let i = 0; i < ringCount; i++) {
      snapshot[i] = ringBuffer[i];
    }
    return snapshot;
  }

  // Buffer is full — oldest frame is at ringHead, wrap around
  const snapshot: Float32Array[] = new Array(BUFFER_SIZE);
  for (let i = 0; i < BUFFER_SIZE; i++) {
    snapshot[i] = ringBuffer[(ringHead + i) % BUFFER_SIZE];
  }
  return snapshot;
}

/**
 * Attempt to match the current buffer against all loaded templates using sliding dynamic windows.
 * Returns the best match result.
 */
export function matchGesture(): MatchResult {
  const result: MatchResult = {
    gesture: null,
    distance: Infinity,
    confidence: 0,
    scores: {},
    bufferFill: ringCount,
  };

  // Need at least 15 frames to even try matching
  if (ringCount < 15 || Object.keys(templateClasses).length === 0) {
    return result;
  }

  // Cooldown check
  const now = Date.now();
  if (now - lastRecognitionTime < COOLDOWN_MS) {
    return result;
  }

  // Zero-copy snapshot of ring buffer in chronological order
  const currentSequence = getRingBufferSnapshot();

  let bestGesture: string | null = null;
  let minDistance = Infinity;

  for (const [className, templateClass] of Object.entries(templateClasses)) {
    let bestVariationDist = Infinity;

    for (const variation of templateClass.variations) {
      const tempLen = variation.sequence.length;
      
      // Buffer must be at least as long as the template variation to match it
      if (currentSequence.length < tempLen) {
        continue;
      }

      // Slice the exact length from the tail of the buffer (the most recent frames)
      const sliceToCompare = currentSequence.slice(currentSequence.length - tempLen);

      const rawDist = dtwDistance(sliceToCompare, variation.sequence);
      
      // Normalize distance so that variations of different lengths are comparable
      const normDist = (rawDist / tempLen) * 30.0;
      
      if (normDist < bestVariationDist) {
        bestVariationDist = normDist;
      }
    }

    result.scores[className] = Math.round(bestVariationDist * 100) / 100;

    if (bestVariationDist < minDistance) {
      minDistance = bestVariationDist;
      bestGesture = className;
    }
  }

  result.distance = minDistance;

  // Threshold gate
  if (bestGesture !== null && minDistance < threshold) {
    // Convert distance to confidence: 0 distance = 100%, threshold distance = 50%
    const calculatedConfidence = Math.max(
      0,
      Math.min(100, Math.round(100 - (minDistance / threshold) * 50))
    );

    // Enforce strict 90% confidence minimum
    if (calculatedConfidence >= 90) {
      result.gesture = bestGesture;
      result.confidence = calculatedConfidence;

      // Duplicate suppression: clear buffer after recognition
      clearBuffer();
      lastRecognitionTime = now;

      console.log(
        `[DTW] RECOGNIZED: '${bestGesture}' | Distance: ${minDistance.toFixed(2)} | Confidence: ${result.confidence}%`
      );
    }
  }

  return result;
}
