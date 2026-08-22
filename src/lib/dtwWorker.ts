/**
 * dtwWorker.ts
 *
 * Dedicated Web Worker for running heavy Dynamic Time Warping computations
 * without blocking the main browser UI thread.
 *
 * Performance notes:
 *   - Uses squared Euclidean distance (no per-cell Math.sqrt) for ~15-30% speedup.
 *   - Pre-allocated snapshot buffer avoids per-match GC pressure.
 *   - Sakoe-Chiba band (radius=5) constrains DTW from O(n²) to O(n·r).
 *   - Early cost pruning (maxCost) bails entire rows when no path can beat current best.
 */

const BUFFER_SIZE = 90; // 3 seconds at 30 fps
const DEFAULT_THRESHOLD = 30.0;
const FEATURE_DIM = 106;
const SAKOE_CHIBA_RADIUS = 5;

interface GestureVariation {
  filename: string;
  sequence: Float32Array[];
}

interface GestureTemplateClass {
  name: string;
  variations: GestureVariation[];
}

// ─── State ───────────────────────────────────────────────────────────
let templateClasses: Record<string, GestureTemplateClass> = {};
let threshold = DEFAULT_THRESHOLD;
let lastRecognitionTime = 0;
const COOLDOWN_MS = 1200;

// ─── Ring Buffer (O(1) push, no shift/copy) ──────────────────────────
const ringBuffer: Float32Array[] = new Array(BUFFER_SIZE);
let ringHead = 0;
let ringCount = 0;

// ─── Pre-allocated Snapshot (zero-alloc matchGesture) ────────────────
const snapshotBuffer: Float32Array[] = new Array(BUFFER_SIZE);
let snapshotLen = 0;

// ─── Pre-allocated DTW Cost Matrix ───────────────────────────────────
const MAX_SEQ_LEN = BUFFER_SIZE + 1;
let dtwPrevRow = new Float64Array(MAX_SEQ_LEN + 1);
let dtwCurrRow = new Float64Array(MAX_SEQ_LEN + 1);

function parseNpy(buffer: ArrayBuffer): Float32Array[] {
  const view = new DataView(buffer);
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

function dtwDistance(
  seq1: Float32Array[], 
  seq2: Float32Array[], 
  maxCost: number = Infinity,
  seq1Start: number = 0,
  seq1Len: number = seq1.length
): number {
  const n = seq1Len;
  const m = seq2.length;
  const r = SAKOE_CHIBA_RADIUS;

  if (dtwPrevRow.length < m + 1) {
    dtwPrevRow = new Float64Array(m + 1);
    dtwCurrRow = new Float64Array(m + 1);
  }

  dtwPrevRow.fill(Infinity, 0, m + 1);
  dtwPrevRow[0] = 0;

  for (let i = 1; i <= n; i++) {
    dtwCurrRow.fill(Infinity, 0, m + 1);

    // Scale the Sakoe-Chiba band correctly to ensure path continuity
    // (guarantees jStart=1 when i=1, and overlapping bounds for steep slopes)
    const jStart = Math.max(1, Math.floor((i - 1) * m / n) + 1 - r);
    const jEnd = Math.min(m, Math.ceil(i * m / n) + r);
    
    let minRowCost = Infinity;

    for (let j = jStart; j <= jEnd; j++) {
      // Squared Euclidean — avoids per-cell Math.sqrt() (~540k calls/match → 0)
      const cost = euclideanDistanceSq(seq1[seq1Start + i - 1], seq2[j - 1]);
      
      dtwCurrRow[j] = cost + Math.min(
        dtwPrevRow[j],     
        dtwCurrRow[j - 1], 
        dtwPrevRow[j - 1]  
      );
      
      if (dtwCurrRow[j] < minRowCost) {
        minRowCost = dtwCurrRow[j];
      }
    }

    if (minRowCost > maxCost) {
      return Infinity;
    }

    const tmp = dtwPrevRow;
    dtwPrevRow = dtwCurrRow;
    dtwCurrRow = tmp;
  }

  return dtwPrevRow[m];
}

/**
 * Fill the pre-allocated snapshot buffer from the ring buffer.
 * Returns the number of valid frames (avoids per-match array allocation).
 */
function fillSnapshot(): number {
  if (ringCount < BUFFER_SIZE) {
    for (let i = 0; i < ringCount; i++) {
      snapshotBuffer[i] = ringBuffer[i];
    }
    snapshotLen = ringCount;
  } else {
    for (let i = 0; i < BUFFER_SIZE; i++) {
      snapshotBuffer[i] = ringBuffer[(ringHead + i) % BUFFER_SIZE];
    }
    snapshotLen = BUFFER_SIZE;
  }
  return snapshotLen;
}

function matchGesture() {
  const result = {
    gesture: null as string | null,
    distance: Infinity,
    confidence: 0,
    scores: {} as Record<string, number>,
    bufferFill: ringCount,
  };

  if (ringCount < 15 || Object.keys(templateClasses).length === 0) {
    return result;
  }

  const now = Date.now();
  if (now - lastRecognitionTime < COOLDOWN_MS) {
    return result;
  }

  const seqLen = fillSnapshot();

  let bestGesture: string | null = null;
  let minDistance = Infinity;

  for (const [className, templateClass] of Object.entries(templateClasses)) {
    let bestVariationDist = Infinity;

    for (const variation of templateClass.variations) {
      const tempLen = variation.sequence.length;
      
      // Try 1.0× first — produces tighter early-prune maxCost for subsequent scales
      const lengthsToTry = [
        tempLen,
        Math.floor(tempLen * 0.8),
        Math.floor(tempLen * 1.2),
      ];

      for (const sliceLen of lengthsToTry) {
        if (seqLen < sliceLen) {
          continue;
        }

        const startIndex = seqLen - sliceLen;
        const maxRawCost = (bestVariationDist / 30.0) * Math.max(sliceLen, tempLen);
        const rawDist = dtwDistance(snapshotBuffer, variation.sequence, maxRawCost, startIndex, sliceLen);
        
        if (rawDist === Infinity) continue; 

        const normDist = (rawDist / Math.max(sliceLen, tempLen)) * 30.0;
        
        if (normDist < bestVariationDist) {
          bestVariationDist = normDist;
        }
      }
    }

    result.scores[className] = Math.round(bestVariationDist * 100) / 100;

    if (bestVariationDist < minDistance) {
      minDistance = bestVariationDist;
      bestGesture = className;
    }
  }

  result.distance = minDistance;

  if (bestGesture !== null && minDistance < threshold) {
    const calculatedConfidence = Math.max(
      0,
      Math.min(100, Math.round(100 - (minDistance / threshold) * 50))
    );

    if (calculatedConfidence >= 90) {
      result.gesture = bestGesture;
      result.confidence = calculatedConfidence;

      ringHead = 0;
      ringCount = 0;
      lastRecognitionTime = now;
    }
  }

  return result;
}

// ─── Worker Message Handler ──────────────────────────────────────────
self.onmessage = async (e: MessageEvent) => {
  const { type, payload, id } = e.data;

  try {
    if (type === 'LOAD_TEMPLATES') {
      const { apiBase } = payload;
      // In a Web Worker, fetch works perfectly.
      // Need origin because worker might be running on a blob URL or root
      const baseUrl = apiBase || self.location.origin;
      const listRes = await fetch(`${baseUrl}/api/templates`);
      if (!listRes.ok) throw new Error("Failed to fetch templates list");
      
      const fileList: string[] = await listRes.json();
      const loadedClasses: Record<string, GestureTemplateClass> = {};

      const fetchPromises = fileList.map(async (filename) => {
        try {
          const res = await fetch(`${baseUrl}/api/templates/${filename}`);
          if (!res.ok) return null;

          const arrayBuffer = await res.arrayBuffer();
          const frames = parseNpy(arrayBuffer);

          let name = filename.replace(/^reference_/, "").replace(/\.npy$/, "");
          const match = name.match(/^(.+?)_\d+$/);
          if (match) {
            name = match[1];
          }
          return { className: name, variation: { filename, sequence: frames } };
        } catch (err) {
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
      self.postMessage({ id, type: 'LOAD_TEMPLATES_DONE', payload: Object.keys(templateClasses) });
    } 
    else if (type === 'PUSH_FRAME') {
      ringBuffer[ringHead] = payload; // Float32Array passed via message
      ringHead = (ringHead + 1) % BUFFER_SIZE;
      if (ringCount < BUFFER_SIZE) ringCount++;
      self.postMessage({ id, type: 'PUSH_FRAME_DONE', payload: ringCount });
    }
    else if (type === 'MATCH_GESTURE') {
      const result = matchGesture();
      self.postMessage({ id, type: 'MATCH_GESTURE_DONE', payload: result });
    }
    else if (type === 'CLEAR_BUFFER') {
      ringHead = 0;
      ringCount = 0;
      self.postMessage({ id, type: 'CLEAR_BUFFER_DONE' });
    }
    else if (type === 'SET_THRESHOLD') {
      threshold = payload;
      self.postMessage({ id, type: 'SET_THRESHOLD_DONE' });
    }
  } catch (err: any) {
    self.postMessage({ id, type: 'ERROR', payload: err.message });
  }
};
