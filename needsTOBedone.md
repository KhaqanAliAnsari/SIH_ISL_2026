# SIH ISL 2026 — Performance Overhaul: Needs To Be Done
> **Focus:** PopSign-inspired optimization — offload MediaPipe inference off the main thread
> **Date:** 2026-09-07 | **Branch:** `ui&ux`

---

## ✅ Already Done (Do NOT Touch)

| What | Where | Status |
|------|-------|--------|
| Camera resolution → 640×480 on native & web | `VideoPanel.tsx:167` | ✅ |
| Model switch `full` → `lite` (5.6 MB vs 9 MB) | `bundle-models.mjs` & `holisticLandmarker.ts` | ✅ |
| MediaPipe in Web Worker (`visionWorker.ts`) | `visionWorker.ts` / `visionEngine.ts` | ✅ |
| Decoupled pose (10fps) vs hands (30fps) | `visionWorker.ts` | ✅ |
| Non-blocking rAF loop via `createImageBitmap` | `VideoPanel.tsx:400-470` | ✅ |
| DTW in Web Worker (zero main-thread math) | `dtwWorker.ts` | ✅ |
| Removed debug log sampling in DTW worker | `dtwWorker.ts` | ✅ |
| 15 FPS downsampling for DTW push (`%2`) | `VideoPanel.tsx:436` | ✅ |
| Ring buffer + pre-allocated snapshot (no GC) | `dtwWorker.ts:36-47` | ✅ |
| Squared Euclidean (no `Math.sqrt` per cell) | `dtwWorker.ts:95-118` | ✅ |
| Sakoe-Chiba band + early cost pruning | `dtwWorker.ts:144-166` | ✅ |
| COOP/COEP headers (WASM SIMD support) | `vite.config.ts` & `vercel.json` | ✅ |
| Stable rAF refs (no useEffect restart on mesh/state) | `VideoPanel.tsx:363-364` | ✅ |
| Static template serve from `/public/templates/` | `dtwWorker.ts:329` | ✅ |
| DOM storage + hardware canvas layer on Android | `MainActivity.java:21-18` | ✅ |
| WebView renderer priority (API 26+) | `MainActivity.java:34` | ✅ |
| Preconnect hints for CDN models & WASM | `index.html:7-10` | ✅ |
| Parallel model + template initialization | `VideoPanel.tsx:157` | ✅ |

---

## 🔥 Phase A — Quick Wins (No Architecture Change)
> **Est. Time: 1–2 hours** | Risk: Low

### A1. Fix camera resolution in browser/web mode
- **File:** `src/components/VideoPanel.tsx` ~line 167
- **Change:** `1280 × 720` → `640 × 480` for the non-native branch
- **Why:** MediaPipe internally resizes to ~256px anyway; sending 720p wastes memory bandwidth
- **Impact:** Reduces GPU texture upload cost by ~75% in browser mode

### A2. Switch to `pose_landmarker_lite` everywhere
- **Files:** `scripts/bundle-models.mjs` + `src/lib/holisticLandmarker.ts`
- **Change:** Update both the download script AND the runtime code to use `pose_landmarker_lite.task`
- **Why:** `holisticLandmarker.ts:105` still loads `pose_landmarker_full.task` (9 MB), and `bundle-models.mjs` downloads the full model too. The lite model (5.6 MB) has ~40% fewer FLOPS with minimal accuracy impact for ISL upper-body tracking.
- **Details:**
  ```js
  // From:
  name: 'pose_landmarker_full.task',
  url: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task'
  // To:
  name: 'pose_landmarker_lite.task',
  url: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'
  ```

### A3. Decouple pose detection rate from hand detection rate
- **File:** `src/lib/holisticLandmarker.ts` + `src/components/VideoPanel.tsx`
- **Change:** Add `detectPose?: boolean` param to `detectHolistic()`. When `false`, skip `poseLandmarker.detectForVideo()` and reuse the cached pose result.
- **In VideoPanel.tsx:** Only call with `detectPose=true` every 3rd frame (~10fps). Hands still run every frame (~30fps).
- **Why:** Upper body pose and head anchors change slowly (2–3 fps) during signing; running pose at 30fps is 10× overkill. Keeps all 53 landmark points (11 pose + 42 hands = 106 dims) for full ISL phonology while cutting GPU pose inference time by 66%.
- **Expected gain:** ~25–35% reduction in main-thread GPU time from pose alone

### A4. Remove 20% debug log sampling in dtwWorker
- **File:** `src/lib/dtwWorker.ts` lines 294–298
- **Change:** Delete or gate behind `if (process.env.NODE_ENV === 'development')`
- **Why:** `Math.random()` + `console.log` inside a hot inner loop has measurable cost on low-end Android



---

## 🚀 Phase B — MAIN WIN: Vision Web Worker Migration
> **Est. Time: 4–8 hours** | Risk: Medium | **Biggest performance unlock**

### B1. Create `src/lib/visionWorker.ts`
New dedicated Web Worker that owns the MediaPipe models. This is the PopSign equivalent.

**Responsibilities:**
- Handles messages: `INIT`, `DETECT_FRAME`, `CLOSE`
- Accepts `ImageBitmap` via transferable (zero memory copy from main thread)
- Runs `poseLandmarker.detectForVideo()` + `handLandmarker.detectForVideo()` **off the main thread**
- Calls `extractHolisticFeatureVector()` internally
- Returns `{ pose, leftHand, rightHand, featureVec }` — transfers `featureVec.buffer`

**Key points:**
- GPU context requires `OffscreenCanvas` in worker scope — instantiate it once at INIT
- Add fallback: if GPU init fails → retry with `delegate: 'CPU'`
- Run a 1×1 dummy warmup frame right after INIT to prime the WASM/WebGL pipeline

```ts
// visionWorker.ts message protocol
// INIT: { wasmUrl, poseModelUrl, handModelUrl }
// DETECT_FRAME: { imageBitmap: ImageBitmap, timestamp: number } — imageBitmap is transferred
// → returns: { pose, leftHand, rightHand, featureVec: Float32Array } — featureVec.buffer transferred
// CLOSE: {}
```

### B2. Create `src/lib/visionEngine.ts`
Proxy module (mirrors `dtwEngine.ts` exactly).

**Exports:**
- `initVisionWorker(): Promise<void>`
- `detectFrame(imageBitmap: ImageBitmap, timestamp: number): Promise<VisionResult>`
- `closeVisionWorker(): void`

### B3. Modify `src/lib/holisticLandmarker.ts`
- **Remove:** `initHolisticLandmarker()`, `detectHolistic()` (moved to visionWorker)
- **Keep:** `extractHolisticFeatureVector()`, `isBodyDetected()`, `HAND_CONNECTIONS`, `POSE_UPPER_BODY_CONNECTIONS`, `FEATURE_DIM`, `HolisticResult` type (still needed by both worker + VideoPanel)

### B4. Modify `src/components/VideoPanel.tsx`

**In `initModel()`:**
```ts
// Replace:
await initHolisticLandmarker();
// With:
await initVisionWorker();
```

**In `runDetection` rAF loop:**
```ts
// Replace the blocking detectHolistic() block with:
if (video.currentTime !== lastVideoTimeRef.current) {
  lastVideoTimeRef.current = video.currentTime;
  
  // Zero-copy frame transfer to vision worker
  const bitmap = await createImageBitmap(video);
  const visionResult = await detectFrame(bitmap, performance.now());
  // bitmap is now consumed/transferred — do not use again
  
  const { result, featureVec } = visionResult;
  lastResultRef.current = result;
  lastFeatureVecRef.current = featureVec;
  const detected = isBodyDetected(featureVec);
  handVisibleRef.current = detected;
  
  // Recorder callback (unchanged)
  if (recorderFrameHandlerRef.current && featureVec) {
    recorderFrameHandlerRef.current(featureVec);
  }
  
  // Draw landmarks (unchanged)
  if (detected) {
    drawLandmarksRef.current(ctx, result, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  // DTW push (unchanged — every other frame at ~15fps)
  // ... existing dtwCooldown / dtwEvalCounter logic ...
}
```

**In cleanup:**
```ts
// Add to useEffect cleanup:
closeVisionWorker();
```

### B5. Update `src/lib/holisticLandmarker.ts` exports
Keep the file as a pure utility library — detection functions removed, extraction + drawing helpers stay.

---

## 🤖 Phase C — Android WebView Tuning
> **Est. Time: 30–60 min** | Risk: Low

### C1. Set WebView renderer priority
- **File:** `android/app/src/main/java/com/sih2026/islvcip/MainActivity.java`
- Add after existing settings block:
  ```java
  // Boost WebView renderer process priority for smooth GPU inference
  if (android.os.Build.VERSION.SDK_INT >= 26) {
      webView.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, true);
  }
  ```

### C2. Verify COOP/COEP in production (Vercel + Android)
- Check `vercel.json` has COOP/COEP headers (needed for SharedArrayBuffer in web deploy)
- Verify WASM SIMD is enabled — if `crossOriginIsolated` is `true` in console, it's working

---

## 📦 Phase D — Template & Startup Optimization
> **Est. Time: 30 min** | Risk: Minimal

### D1. Prefetch templates in `index.html`
- **File:** `index.html`
- Add `<link rel="prefetch">` for frequently used templates so they're cached before the DTW worker requests them
- Or: use Service Worker (stretch goal) to cache templates offline

### D2. Parallel model + template loading
- Currently `initModel()` and `initTemplates()` are called sequentially in `toggleWebcam()`
- Change to `await Promise.all([initModel(), initTemplates()])` so they race

---

## ⚠️ Things to Watch Out For

| Trap | Mitigation |
|------|-----------|
| `OffscreenCanvas` GPU context may fail on old WebView | Fallback to `delegate: 'CPU'` in visionWorker with a try/catch |
| `createImageBitmap` requires the video to be in `readyState >= 2` | Already gated — existing check at VideoPanel.tsx:380 |
| `TemplateRecorderModal` uses `recorderFrameHandlerRef` inline | Must update to receive `featureVec` from async vision result, not inline in rAF |
| Transferred `ImageBitmap` cannot be reused after transfer | Create a new bitmap every frame — never re-use |
| Vision worker init can take 2–3 seconds on first load | Show loading spinner (already in `modelLoading` state) — no change needed |
| Template downsampling `idx % 2 === 0` in `dtwWorker.ts:340` | Keep this — templates are loaded at 15fps to match live stream. Do NOT remove. |

---

## 📊 Expected Results After All Phases

| Metric | Before | After (Estimate) |
|--------|--------|-----------------|
| Main thread time per frame | ~20–35ms (blocking) | ~2–5ms (bitmap create + draw) |
| Gesture recognition lag | 0.5–1.5s | ~100–300ms |
| Android FPS (30fps target) | 15–22fps (jank) | 28–30fps |
| APK model size | 9MB (full) bundled | 5.6MB (lite) |
| Camera GPU texture size | 1280×720 (browser) | 640×480 everywhere |

---

## 🗂️ File Change Summary

| File | Action | Phase |
|------|--------|-------|
| `src/components/VideoPanel.tsx` | Modify rAF loop + init + camera res | A1, A3, B4 |
| `src/lib/holisticLandmarker.ts` | Fix model name (A2), remove init/detect (B3), keep extract | A2, B3 |
| `src/lib/visionWorker.ts` | **NEW** — MediaPipe worker | B1 |
| `src/lib/visionEngine.ts` | **NEW** — proxy module | B2 |
| `scripts/bundle-models.mjs` | Fix URL + filename to lite model | A2 |
| `src/lib/dtwWorker.ts` | Remove debug log | A4 |
| `android/app/.../MainActivity.java` | Add renderer priority | C1 |
| `index.html` | Add prefetch hints | D1 |

---

## 🔗 References
- [PopSign ASL](https://play.google.com/store/apps/details?id=edu.gatech.ccg.popsign) — MediaPipe TFLite on-device, background thread
- [MediaPipe Tasks Vision — Web Worker docs](https://ai.google.dev/edge/mediapipe/solutions/guide)
- [OffscreenCanvas MDN](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
- [ImageBitmap transferable MDN](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap)
