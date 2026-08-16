/**
 * dtwEngine.ts
 *
 * Browser-side DTW (Dynamic Time Warping) gesture recognition engine.
 * Mirrors the logic from isl_dtw/main.py:
 *   - Loads .npy template files via fetch
 *   - Rolling 30-frame buffer
 *   - FastDTW with Euclidean distance
 *   - Threshold-gated recognition with duplicate suppression
 */

// ─── Constants ───────────────────────────────────────────────────────
const BUFFER_SIZE = 30;
const DEFAULT_THRESHOLD = 30.0;
const FEATURE_DIM = 106;

// ─── Types ───────────────────────────────────────────────────────────
export interface GestureTemplate {
  name: string;
  sequence: Float32Array[]; // Array of 30 frames, each 42-dim
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
let frameBuffer: Float32Array[] = [];
let threshold = DEFAULT_THRESHOLD;
let lastRecognitionTime = 0;
const COOLDOWN_MS = 2000; // prevent duplicate triggers for 2s

// ─── .npy Parser ─────────────────────────────────────────────────────
/**
 * Parse a NumPy .npy file (v1.0 format) into a typed array.
 * Supports float32 (dtype '<f4') with shape (N, 42).
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

  // Extract shape tuple from header, e.g. "'shape': (30, 42)"
  const shapeMatch = headerStr.match(/shape['"]\s*:\s*\(([^)]+)\)/);
  if (!shapeMatch) throw new Error("Could not parse shape from .npy header");

  const shapeParts = shapeMatch[1].split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const numRows = shapeParts[0] || 0;
  const numCols = shapeParts.length > 1 ? shapeParts[1] : FEATURE_DIM;

  if (numCols !== FEATURE_DIM) {
    throw new Error(`Expected ${FEATURE_DIM} features per frame, got ${numCols}`);
  }

  // Read float32 data
  const floatData = new Float32Array(buffer, dataOffset);
  const frames: Float32Array[] = [];

  for (let i = 0; i < numRows; i++) {
    const frame = new Float32Array(FEATURE_DIM);
    for (let j = 0; j < FEATURE_DIM; j++) {
      frame[j] = floatData[i * FEATURE_DIM + j];
    }
    frames.push(frame);
  }

  return frames;
}

// ─── Euclidean Distance ──────────────────────────────────────────────
function euclideanDistance(a: Float32Array, b: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

// ─── FastDTW (Simplified) ────────────────────────────────────────────
/**
 * Standard DTW (not the full FastDTW with radius constraint, but
 * with the same result for sequences of length ~30 — performance
 * is fine for real-time at 30 frames).
 */
function dtwDistance(seq1: Float32Array[], seq2: Float32Array[]): number {
  const n = seq1.length;
  const m = seq2.length;

  // Use a 2-row rolling array to save memory
  let prevRow = new Float64Array(m + 1);
  let currRow = new Float64Array(m + 1);

  // Initialize
  prevRow.fill(Infinity);
  prevRow[0] = 0;

  for (let i = 1; i <= n; i++) {
    currRow.fill(Infinity);
    for (let j = 1; j <= m; j++) {
      const cost = euclideanDistance(seq1[i - 1], seq2[j - 1]);
      currRow[j] = cost + Math.min(
        prevRow[j],     // insertion
        currRow[j - 1], // deletion
        prevRow[j - 1]  // match
      );
    }
    // Swap rows
    [prevRow, currRow] = [currRow, prevRow];
  }

  return prevRow[m];
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Load gesture templates from the server API.
 * Fetches the template list, then downloads and parses each .npy file.
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

    for (const filename of fileList) {
      try {
        const res = await fetch(`${apiBase}/api/templates/${filename}`);
        if (!res.ok) continue;

        const arrayBuffer = await res.arrayBuffer();
        const frames = parseNpy(arrayBuffer);

        // Extract gesture name: "reference_hello.npy" → "hello"
        const name = filename
          .replace(/^reference_/, "")
          .replace(/\.npy$/, "");

        loaded.push({ name, sequence: frames });
        console.log(`[DTW] Loaded template '${name}' (${frames.length} frames)`);
      } catch (err) {
        console.warn(`[DTW] Failed to load template '${filename}':`, err);
      }
    }

    templates = loaded;
    return loaded;
  } catch (err) {
    console.warn("[DTW] Template loading failed:", err);
    return [];
  }
}

/**
 * Push a feature vector frame into the rolling buffer.
 */
export function pushFrame(featureVector: Float32Array): void {
  frameBuffer.push(featureVector);
  if (frameBuffer.length > BUFFER_SIZE) {
    frameBuffer.shift();
  }
}

/**
 * Clear the frame buffer (called after recognition to prevent duplicates).
 */
export function clearBuffer(): void {
  frameBuffer = [];
}

/**
 * Get current buffer fill level.
 */
export function getBufferFill(): number {
  return frameBuffer.length;
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
 * Get the number of loaded templates.
 */
export function getTemplateCount(): number {
  return templates.length;
}

/**
 * Get loaded template names.
 */
export function getTemplateNames(): string[] {
  return templates.map(t => t.name);
}

/**
 * Attempt to match the current buffer against all loaded templates.
 * Returns the best match result.
 *
 * Mirrors isl_dtw/main.py recognition loop:
 *   - Only matches when buffer is full (30 frames)
 *   - Computes DTW distance against all templates
 *   - Returns best match if below threshold
 *   - Clears buffer after recognition (duplicate suppression)
 */
export function matchGesture(): MatchResult {
  const result: MatchResult = {
    gesture: null,
    distance: Infinity,
    confidence: 0,
    scores: {},
    bufferFill: frameBuffer.length,
  };

  // Need full buffer and at least one template
  if (frameBuffer.length < BUFFER_SIZE || templates.length === 0) {
    return result;
  }

  // Cooldown check
  const now = Date.now();
  if (now - lastRecognitionTime < COOLDOWN_MS) {
    return result;
  }

  const currentSequence = [...frameBuffer];

  let bestGesture: string | null = null;
  let minDistance = Infinity;

  for (const template of templates) {
    const dist = dtwDistance(currentSequence, template.sequence);
    result.scores[template.name] = Math.round(dist * 100) / 100;

    if (dist < minDistance) {
      minDistance = dist;
      bestGesture = template.name;
    }
  }

  result.distance = minDistance;

  // Threshold gate
  if (bestGesture !== null && minDistance < threshold) {
    result.gesture = bestGesture;
    // Convert distance to confidence: 0 distance = 100%, threshold distance = 50%
    result.confidence = Math.max(
      0,
      Math.min(100, Math.round(100 - (minDistance / threshold) * 50))
    );

    // Duplicate suppression: clear buffer after recognition
    clearBuffer();
    lastRecognitionTime = now;

    console.log(
      `[DTW] RECOGNIZED: '${bestGesture}' | Distance: ${minDistance.toFixed(2)} | Confidence: ${result.confidence}%`
    );
  }

  return result;
}
