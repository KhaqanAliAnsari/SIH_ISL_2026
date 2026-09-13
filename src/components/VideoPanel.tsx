import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  Activity,
  User,
  CheckCircle2,
  UserCheck,
  RefreshCw,
  Eye,
  Zap,
  Settings,
  FlipHorizontal,
  Lock,
  Video,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DemoState, SentenceToken, SentenceEngineState } from "../types";
import { Capacitor } from '@capacitor/core';
import {
  isBodyDetected,
  extractHolisticFeatureVector,
  initMainThreadLandmarker,
  detectMainThread,
  closeMainThreadLandmarker,
  HAND_CONNECTIONS,
  POSE_UPPER_BODY_CONNECTIONS,
  type HolisticResult,
} from "../lib/holisticLandmarker";
import {
  initVisionWorker,
  detectFrame,
  closeVisionWorker,
} from "../lib/visionEngine";
import {
  loadTemplates,
  pushFrame,
  matchGesture,
  getBufferFill,
  getTemplateCount,
  getTemplateNames,
  clearBuffer,
  type MatchResult,
} from "../lib/dtwEngine";
import {
  getStopGestureName,
  setStopGestureName,
} from "../lib/sentenceEngine";
import { TemplateRecorderModal } from "./TemplateRecorderModal";

import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

interface VideoPanelProps {
  demoState: DemoState;
  livenessCode: string;
  recordingDuration: string;
  customerName: string;
  customerAadhaar: string;
  onCaptureSnapshot?: (dataUrl: string) => void;
  onTriggerLiveness?: () => void;
  currentStepLabel: string;
  isLivenessMatchConfirmed?: boolean;
  livenessMatchIndex?: number;
  onGestureRecognized?: (gesture: string, distance: number, confidence: number) => void;
  currentSentenceTokens?: SentenceToken[];
  sentenceEngineState?: SentenceEngineState;
  forceStopCamera?: boolean;
}

// Fingertip + wrist landmark indices for larger dot rendering
const KEY_LANDMARKS = new Set([0, 4, 8, 12, 16, 20]);

export const VideoPanel: React.FC<VideoPanelProps> = ({
  demoState,
  livenessCode,
  recordingDuration,
  customerName,
  customerAadhaar,
  onCaptureSnapshot,
  onTriggerLiveness,
  currentStepLabel,
  isLivenessMatchConfirmed = false,
  livenessMatchIndex = 0,
  onGestureRecognized,
  currentSentenceTokens = [],
  sentenceEngineState = "IDLE",
  forceStopCamera = false,
}) => {
  const [useWebcam, setUseWebcam] = useState(false);
  const [showMesh, setShowMesh] = useState(true);
  const [modelReady, setModelReady] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);
  const [lastMatch, setLastMatch] = useState<MatchResult | null>(null);
  const [handVisible, setHandVisible] = useState(false);
  const [bufferFill, setBufferFill] = useState(0);
  const [activeStopGesture, setActiveStopGesture] = useState<string>(getStopGestureName());
  const [showStopConfig, setShowStopConfig] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const isNative = Capacitor.isNativePlatform() || new URLSearchParams(window.location.search).has('native');
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animFrameRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  // Performance refs
  const lastExtractionTimeRef = useRef(0);
  const lastDrawnExtractionTimeRef = useRef(-1);
  const lastResultRef = useRef<HolisticResult | null>(null);
  const lastFeatureVecRef = useRef<Float32Array | null>(null);
  const handVisibleRef = useRef(false);
  const bufferFillRef = useRef(0);
  const lastUiFlushRef = useRef(0);
  const dtwCooldown = useRef(0);
  const dtwEvalCounter = useRef(0);
  const debounceGestureRef = useRef<string | null>(null);
  const debounceCountRef = useRef(0);
  const recorderFrameHandlerRef = useRef<((frame: Float32Array) => void) | null>(null);

  // Stable refs for rAF loop — prevents useEffect restart on callback identity changes
  const drawLandmarksRef = useRef<(ctx: CanvasRenderingContext2D, result: HolisticResult, w: number, h: number) => void>(() => { });
  const onGestureRecognizedRef = useRef(onGestureRecognized);

  const handleRegisterFrameHandler = useCallback((handler: ((frame: Float32Array) => void) | null) => {
    recorderFrameHandlerRef.current = handler;
  }, []);

  // Profiler metrics
  const skippedDrawsRef = useRef(0);
  const actualDrawsRef = useRef(0);
  const fpsFrameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(0);
  const [modelMode, setModelMode] = useState<"worker" | "main" | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const modelModeRef = useRef<"worker" | "main" | null>(null);
  modelModeRef.current = modelMode;
  const consecutiveWorkerErrorsRef = useRef(0);

  // ─── Initialize MediaPipe + Load Templates ─────────────────────────
  const initModel = useCallback(async () => {
    if (modelReady || modelLoading) return;
    setModelLoading(true);
    setModelError(null);
    try {
      const { delegate } = await initVisionWorker();
      setModelReady(true);
      setModelMode("worker");
      console.log(`[VideoPanel] MediaPipe initialized in visionWorker (${delegate})`);
    } catch (workerErr: any) {
      console.warn("[VideoPanel] VisionWorker failed, attempting main-thread fallback:", workerErr);
      try {
        await initMainThreadLandmarker();
        setModelReady(true);
        setModelMode("main");
        console.log("[VideoPanel] MediaPipe initialized on Main Thread fallback");
      } catch (mainErr: any) {
        console.error("[VideoPanel] Both worker and main-thread MediaPipe failed:", mainErr);
        setModelError(mainErr?.message || workerErr?.message || "Failed to load MediaPipe");
      }
    }
    setModelLoading(false);
  }, [modelReady, modelLoading]);

  const initTemplates = useCallback(async () => {
    if (templatesLoaded) return;
    try {
      const loaded = await loadTemplates();
      setTemplatesLoaded(loaded.length > 0);
      console.log(`[VideoPanel] Loaded ${loaded.length} DTW templates: ${getTemplateNames().join(", ")}`);
    } catch (err) {
      console.error("[VideoPanel] Failed to load templates:", err);
    }
  }, [templatesLoaded]);

  const toggleWebcam = async () => {
    if (!useWebcam) {
      try {
        // Parallel model + template loading (Phase D2)
        await Promise.all([initModel(), initTemplates()]);

        const constraints = {
          video: isNative
            ? (Capacitor.isNativePlatform()
              ? { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30, max: 30 } }
              : { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30, max: 30 } })
            : { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30, max: 30 } }
        };
        let stream: MediaStream;

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } else {
          const getUserMedia =
            (navigator as any).getUserMedia ||
            (navigator as any).webkitGetUserMedia ||
            (navigator as any).mozGetUserMedia ||
            (navigator as any).msGetUserMedia;

          if (!getUserMedia) {
            alert("Your browser does not support accessing the camera.");
            return;
          }

          stream = await new Promise((resolve, reject) => {
            getUserMedia.call(navigator, constraints, resolve, reject);
          });
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playErr: any) {
            if (playErr?.name !== "AbortError") {
              console.warn("[VideoPanel] video.play() error:", playErr);
            }
          }
        }
        setUseWebcam(true);
      } catch (err) {
        console.error("[VideoPanel] Camera access failed:", err);
        setUseWebcam(false);
      }
    } else {
      isRunningRef.current = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setUseWebcam(false);
      setHandVisible(false);
      setBufferFill(0);
    }
  };

  // ─── Auto-start Webcam on Mount ────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    if (!useWebcam) {
      toggleWebcam().catch(err => console.error("Auto-start failed", err));
    }
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Force Stop Camera Effect ──────────────────────────────────────
  useEffect(() => {
    if (forceStopCamera && useWebcam) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setUseWebcam(false);
      setHandVisible(false);
      setBufferFill(0);
      isRunningRef.current = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  }, [forceStopCamera, useWebcam]);

  // ─── Ultra-Fast Batched Landmark Drawing (Zero Heap Allocation) ────
  const drawLandmarks = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      result: HolisticResult,
      width: number,
      height: number
    ) => {
      ctx.clearRect(0, 0, width, height);
      if (!showMesh) return;

      const strokeColor = demoState === "low_confidence_or_escalated" ? "#D97706" : "#00FFB4";
      const keyDotColor = demoState === "low_confidence_or_escalated" ? "#F59E0B" : "#008CFF";

      const drawPartBatched = (
        landmarks: NormalizedLandmark[],
        connections: [number, number][],
        baseColor: string,
        isHand: boolean,
        label: string
      ) => {
        const len = landmarks?.length || 0;
        if (len === 0) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        // 1. Compound Path for all Connections (1 stroke instead of ~21)
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        for (let i = 0; i < connections.length; i++) {
          const [from, to] = connections[i];
          if (from < len && to < len) {
            ctx.moveTo(landmarks[from].x * width, landmarks[from].y * height);
            ctx.lineTo(landmarks[to].x * width, landmarks[to].y * height);
          }
        }
        ctx.stroke();

        // 2. Compound Path for standard Dots & Track Bounding Box Inline (1 fill instead of ~53)
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        for (let i = 0; i < len; i++) {
          const px = landmarks[i].x * width;
          const py = landmarks[i].y * height;
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;

          if (!isHand || !KEY_LANDMARKS.has(i)) {
            ctx.moveTo(px + 4, py);
            ctx.arc(px, py, 4, 0, 2 * Math.PI);
          }
        }
        ctx.fill();

        // 3. Compound Path for Key Dots (larger fingertip & wrist highlights)
        if (isHand) {
          ctx.fillStyle = keyDotColor;
          ctx.beginPath();
          for (let i = 0; i < len; i++) {
            if (KEY_LANDMARKS.has(i)) {
              const px = landmarks[i].x * width;
              const py = landmarks[i].y * height;
              ctx.moveTo(px + 6, py);
              ctx.arc(px, py, 6, 0, 2 * Math.PI);
            }
          }
          ctx.fill();

          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 0; i < len; i++) {
            if (KEY_LANDMARKS.has(i)) {
              const px = landmarks[i].x * width;
              const py = landmarks[i].y * height;
              ctx.moveTo(px + 7, py);
              ctx.arc(px, py, 7, 0, 2 * Math.PI);
            }
          }
          ctx.stroke();
        }

        // 4. Bounding Box & Label
        if (minX !== Infinity) {
          const pad = 14;
          ctx.strokeStyle = baseColor;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.6;
          ctx.strokeRect(minX - pad, minY - pad, (maxX - minX) + pad * 2, (maxY - minY) + pad * 2);
          ctx.globalAlpha = 1.0;

          ctx.font = "11px monospace";
          ctx.fillStyle = baseColor;
          ctx.fillText(label, minX - pad, minY - pad - 6);
        }
      };

      if (result.pose) {
        drawPartBatched(result.pose, POSE_UPPER_BODY_CONNECTIONS, strokeColor, false, "Upper Body");
      }
      if (result.leftHand) {
        drawPartBatched(result.leftHand, HAND_CONNECTIONS, "#00E5FF", true, "Left Hand");
      }
      if (result.rightHand) {
        drawPartBatched(result.rightHand, HAND_CONNECTIONS, "#FF9100", true, "Right Hand");
      }
    },
    [showMesh, demoState]
  );

  // Keep refs in sync with latest values (safe during render — refs don't trigger re-renders)
  drawLandmarksRef.current = drawLandmarks;
  onGestureRecognizedRef.current = onGestureRecognized;

  // ─── Detection + DTW Loop ──────────────────────────────────────────
  const isMatchingRef = useRef(false);
  const isDetectingRef = useRef(false);
  const lastVideoTimeRef = useRef(-1);

  useEffect(() => {
    if (!useWebcam || !modelReady) return;

    isRunningRef.current = true;

    const runDetection = () => {
      if (!isRunningRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(runDetection);
        return;
      }

      // Match canvas to video dimensions
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 800;
        canvas.height = video.videoHeight || 500;
        canvasCtxRef.current = null; // force context refresh if dimensions changed
      }

      if (!canvasCtxRef.current) {
        canvasCtxRef.current = canvas.getContext("2d", { willReadFrequently: false });
      }
      const ctx = canvasCtxRef.current;
      if (!ctx) {
        animFrameRef.current = requestAnimationFrame(runDetection);
        return;
      }

      if (video.currentTime !== lastVideoTimeRef.current) {
        if (modelModeRef.current === "main") {
          lastVideoTimeRef.current = video.currentTime;
          const result = detectMainThread(video, performance.now());
          const featureVec = extractHolisticFeatureVector(result);
          const detected = isBodyDetected(featureVec);

          lastResultRef.current = result;
          lastFeatureVecRef.current = featureVec;
          handVisibleRef.current = detected;

          if (recorderFrameHandlerRef.current && featureVec) {
            recorderFrameHandlerRef.current(featureVec);
          }

          if (detected) {
            drawLandmarksRef.current(ctx, result, canvas.width, canvas.height);
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }

          if (dtwCooldown.current > 0) dtwCooldown.current--;

          if (detected && dtwCooldown.current === 0) {
            pushFrame(featureVec).then(fill => {
              bufferFillRef.current = fill;
            });

            dtwEvalCounter.current++;
            
            if (dtwEvalCounter.current % 4 === 0 && !isMatchingRef.current) {
              isMatchingRef.current = true;
              matchGesture().then(match => {
                isMatchingRef.current = false;
                if (match.gesture) {
                  setLastMatch(match);
                  dtwCooldown.current = 30;
                  debounceGestureRef.current = null;
                  debounceCountRef.current = 0;
                  clearBuffer();
                  onGestureRecognizedRef.current?.(match.gesture, match.distance, match.confidence);
                }
              }).catch(err => {
                console.error("Worker match failed:", err);
                isMatchingRef.current = false;
              });
            }
          } else {
            bufferFillRef.current = getBufferFill();
          }
        } else if (!isDetectingRef.current) {
          lastVideoTimeRef.current = video.currentTime;
          isDetectingRef.current = true;

          const t0 = performance.now();
          createImageBitmap(video)
            .then(bitmap => detectFrame(bitmap, performance.now()))
            .then(visionResult => {
              isDetectingRef.current = false;
              if (!isRunningRef.current) return;
              consecutiveWorkerErrorsRef.current = 0;

              const { result, featureVec } = visionResult;
              const detected = isBodyDetected(featureVec);

              lastResultRef.current = result;
              lastFeatureVecRef.current = featureVec;
              handVisibleRef.current = detected;

              // Dispatch frame to template recorder if active
              if (recorderFrameHandlerRef.current && featureVec) {
                recorderFrameHandlerRef.current(featureVec);
              }

              // Render landmarks immediately onto canvas (zero UI block)
              if (detected) {
                drawLandmarksRef.current(ctx, result, canvas.width, canvas.height);
              } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }

              // Push to DTW buffer and match gestures via Web Worker
              if (dtwCooldown.current > 0) dtwCooldown.current--;

              if (detected && dtwCooldown.current === 0) {
                pushFrame(featureVec).then(fill => {
                  bufferFillRef.current = fill;
                });

                dtwEvalCounter.current++;
                
                if (dtwEvalCounter.current % 4 === 0 && !isMatchingRef.current) {
                  isMatchingRef.current = true;
                  matchGesture().then(match => {
                    isMatchingRef.current = false;
                    if (match.gesture) {
                      setLastMatch(match);
                      dtwCooldown.current = 30; // 1.0 second cooldown at 30fps
                      debounceGestureRef.current = null;
                      debounceCountRef.current = 0;
                      clearBuffer();
                      onGestureRecognizedRef.current?.(match.gesture, match.distance, match.confidence);
                    }
                  }).catch(err => {
                    console.error("Worker match failed:", err);
                    isMatchingRef.current = false;
                  });
                }
              } else {
                bufferFillRef.current = getBufferFill();
              }

              const t1 = performance.now();
              if (Math.random() < 0.02) {
                console.log(`[Profiler] Vision worker roundtrip: ${(t1 - t0).toFixed(1)}ms`);
              }
            })
            .catch(err => {
              isDetectingRef.current = false;
              console.warn("[VideoPanel] Detection frame dropped:", err);
              consecutiveWorkerErrorsRef.current++;
              if (consecutiveWorkerErrorsRef.current > 5 && modelModeRef.current === "worker") {
                console.warn("[VideoPanel] Repeated worker detection failures. Switching to main-thread fallback...");
                consecutiveWorkerErrorsRef.current = 0;
                initMainThreadLandmarker().then(() => {
                  setModelMode("main");
                }).catch(e => console.error("Main thread fallback also failed:", e));
              }
            });
        }
      }

      // Throttled UI state flush (~30Hz) for buttery smooth buffer filling
      const now = performance.now();
      if (now - lastUiFlushRef.current > 32) {
        lastUiFlushRef.current = now;
        setHandVisible(handVisibleRef.current);
        setBufferFill(bufferFillRef.current);
      }

      fpsFrameCountRef.current++;
      if (lastFpsTimeRef.current === 0) lastFpsTimeRef.current = now;
      if (now - lastFpsTimeRef.current >= 1000) {
        console.log(`[Profiler] Achieved Real-Time FPS: ${Math.round((fpsFrameCountRef.current * 1000) / (now - lastFpsTimeRef.current))}`);
        fpsFrameCountRef.current = 0;
        lastFpsTimeRef.current = now;
      }

      animFrameRef.current = requestAnimationFrame(runDetection);
    };

    animFrameRef.current = requestAnimationFrame(runDetection);

    return () => {
      isRunningRef.current = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [useWebcam, modelReady]);

  // ─── Cleanup on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      closeVisionWorker();
      closeMainThreadLandmarker();
    };
  }, []);

  // ─── Recognition Banner State ──────────────────────────────────────
  const [showRecognitionBanner, setShowRecognitionBanner] = useState(false);
  useEffect(() => {
    if (lastMatch?.gesture) {
      setShowRecognitionBanner(true);
      const timer = setTimeout(() => setShowRecognitionBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastMatch]);

  return (
    <div
      className="col-span-12 lg:col-span-7 flex flex-col lg:h-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden relative"
      style={isNative ? { minHeight: '75vh', flexShrink: 0 } : { minHeight: '40vh' }}
    >
      {/* Video Overlay Top Header */}
      <div className="absolute top-0 left-0 right-0 px-3 py-2 bg-zinc-900/95 text-white z-20 flex items-center justify-between border-b border-zinc-800 shadow-none">
        {/* Record Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-white font-mono text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>REC {recordingDuration}</span>
            <span className="text-zinc-600 mx-1">|</span>
            <span className="text-[10px] text-zinc-400">1080p 30FPS</span>
          </div>

          {/* Model Status Indicator */}
          {useWebcam && (
            <div className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${modelReady
                ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                : modelError
                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                : "bg-zinc-800 text-zinc-400 border-zinc-700"
              }`}>
              <Zap className="w-3 h-3" />
              {modelLoading
                ? "MediaPipe is Loading..."
                : modelReady
                ? `MediaPipe Active (${modelMode === "worker" ? "Worker" : "Main"})`
                : modelError
                ? `Error: ${modelError.slice(0, 30)}`
                : "AI Standby"}
            </div>
          )}
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
          {/* STOP Gesture Config Badge/Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStopConfig(!showStopConfig);
                setShowSettings(false);
              }}
              className="px-2 py-1 rounded text-xs font-mono border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 flex items-center gap-1 transition-colors"
              title="Configure which sign acts as the sentence STOP delimiter"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              <span>STOP: <strong className="uppercase">{activeStopGesture}</strong></span>
            </button>

            {showStopConfig && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-3 z-50 text-xs text-white">
                <div className="font-bold text-white mb-1 flex items-center justify-between">
                  <span>Configure STOP Gesture</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Sign delimiter</span>
                </div>
                <p className="text-[11px] text-zinc-400 mb-2 leading-tight">
                  Choose which sign ends a sentence and merges letters into words:
                </p>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-400 block mb-0.5">Gesture Name:</label>
                    <input
                      type="text"
                      value={activeStopGesture}
                      onChange={(e) => {
                        setActiveStopGesture(e.target.value);
                        setStopGestureName(e.target.value);
                      }}
                      placeholder="e.g. stop, period, halt"
                      className="w-full px-2 py-1 bg-zinc-950 border border-zinc-700 rounded font-mono text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {getTemplateNames().length > 0 && (
                    <div>
                      <label className="text-[10px] font-mono text-zinc-400 block mb-0.5">Or Pick from Loaded Signs:</label>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {getTemplateNames().map((name) => (
                          <button
                            key={name}
                            onClick={() => {
                              setActiveStopGesture(name);
                              setStopGestureName(name);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${activeStopGesture === name
                                ? "bg-sky-500 text-black border-sky-400 font-bold"
                                : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                              }`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => setShowStopConfig(false)}
                      className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-bold"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowSettings(!showSettings);
                setShowStopConfig(false);
              }}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent transition-colors"
              title="Camera Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {showSettings && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-2 z-50 flex flex-col gap-2">
                <button
                  onClick={() => setShowMesh(!showMesh)}
                  className={`w-full px-2 py-1.5 rounded text-xs font-medium border flex items-center gap-2 transition-colors ${showMesh
                      ? "bg-zinc-800 border-zinc-600 text-white font-bold"
                      : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white"
                    }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>{showMesh ? "Landmarks On" : "Landmarks Off"}</span>
                </button>

                <button
                  onClick={toggleWebcam}
                  className={`w-full px-2 py-1.5 rounded text-xs font-medium border flex items-center gap-2 transition-colors ${useWebcam
                      ? "bg-sky-500/10 border-sky-500/30 text-sky-400 font-bold"
                      : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white"
                    }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{useWebcam ? "Webcam Active" : "Use Camera"}</span>
                </button>

                <button
                  onClick={() => {
                    setIsRecorderOpen(true);
                    setShowSettings(false);
                  }}
                  className="w-full px-2 py-1.5 rounded text-xs font-medium border bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Record Sign</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="relative flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full ${useWebcam ? 'block' : 'hidden'}`}
          style={{ transform: 'scaleX(-1)', objectFit: 'cover' }}
        />
        {!useWebcam && (
          <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-500">
            <p className="z-10 text-[10px] text-zinc-400 uppercase tracking-wider font-mono bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800 font-bold backdrop-blur-sm">
              Live WebRTC Stream — Customer View
            </p>
          </div>
        )}

        {/* AI Landmark Overlay Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={useWebcam ? { transform: "scaleX(-1)" } : undefined}
        />

        {/* DTW Buffer + Hand Status */}
        {useWebcam && modelReady && (
          <div className="absolute bottom-3 left-3 z-20 bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 rounded-lg px-3 py-2 text-white space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className={`w-2 h-2 rounded-full ${handVisible ? "bg-white" : "bg-zinc-600"}`}></span>
              <span className={handVisible ? "text-white" : "text-zinc-500"}>{handVisible ? "Body Detected" : "No Subject"}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="text-zinc-400">Buffer:</span>
              <div className="w-20 h-1.5 bg-zinc-800 rounded overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{ width: `${(bufferFill / 90) * 100}%` }}
                />
              </div>
              <span className="text-zinc-400">{bufferFill}/90</span>
            </div>
            {templatesLoaded && (
              <div className="text-[10px] font-mono text-zinc-500">
                Templates: {getTemplateCount()} ({getTemplateNames().join(", ")})
              </div>
            )}
          </div>
        )}

        {/* DTW Recognition Banner */}
        <AnimatePresence>
          {showRecognitionBanner && lastMatch?.gesture && (
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)", x: "-50%" }}
              animate={{ opacity: 1, y: "-50%", scale: 1, filter: "blur(0px)", x: "-50%" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(5px)", transition: { ease: "easeOut", duration: 0.15 } }}
              transition={{ type: "spring", damping: 0.8, duration: 0.4 }}
              className="absolute top-1/2 left-1/2 z-30 pointer-events-none"
            >
              <div className="bg-zinc-900/90 backdrop-blur-md text-white font-black text-sm px-6 py-3 rounded-xl border border-zinc-700/80 flex items-center gap-3 uppercase tracking-wider shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <div>
                  <div className="text-base text-zinc-100">GESTURE: {lastMatch.gesture.toUpperCase()}</div>
                  <div className="text-[10px] font-mono font-normal text-zinc-400">
                    DTW: {lastMatch.distance.toFixed(2)} | Confidence: {lastMatch.confidence}%
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LIVENESS CODE PROMPT OVERLAY */}
        {demoState === "liveness_code_step" && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-md bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white">
            <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-zinc-800">
              <span className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-zinc-400" />
                LIVENESS CODE PROMPTED TO CUSTOMER
              </span>
              <span className="text-[10px] font-mono bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700 font-bold">
                Step 5/7
              </span>
            </div>

            <p className="text-zinc-400 text-xs mb-2">
              Customer is requested to sign these 4 digits in exact order:
            </p>

            <div className="flex items-center justify-center gap-3 py-2 bg-zinc-900 rounded border border-zinc-800">
              {livenessCode.split("").map((digit, idx) => {
                const isMatched = idx < livenessMatchIndex;
                const isActive = idx === livenessMatchIndex && livenessMatchIndex < livenessCode.length;
                return (
                  <div
                    key={idx}
                    className={`w-12 h-14 rounded font-mono font-bold text-2xl flex items-center justify-center border transition-all duration-300 ${
                      isMatched
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : isActive
                          ? 'bg-amber-950 text-amber-300 border-amber-500 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                          : 'bg-zinc-950 text-white border-zinc-700'
                    }`}
                  >
                    {digit}
                  </div>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className={`font-bold flex items-center gap-1 ${
                livenessMatchIndex >= livenessCode.length ? 'text-emerald-400' : 'text-zinc-400'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {livenessMatchIndex >= livenessCode.length
                  ? 'All Digits Verified ✓'
                  : `Matched ${livenessMatchIndex}/${livenessCode.length} digits`
                }
              </span>
              <button
                onClick={onTriggerLiveness}
                className="text-zinc-400 hover:text-white font-semibold underline text-[11px] flex items-center gap-1 font-mono transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> New Prompt
              </button>
            </div>
          </div>
        )}

        {/* LIVENESS MATCH CONFIRMED INDICATOR */}
        {livenessMatchIndex >= livenessCode.length && demoState === "liveness_code_step" && !showRecognitionBanner && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <div className="bg-emerald-500 text-black font-black text-sm px-4 py-2 rounded-lg border-2 border-emerald-400 flex items-center gap-2 uppercase tracking-wider shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-black" />
              <span>LIVENESS VERIFIED</span>
            </div>
          </div>
        )}

        {/* INTERPRETER TILE */}
        {demoState === "low_confidence_or_escalated" && (
          <div className="absolute bottom-3 right-3 z-20 w-60 h-40 bg-zinc-950 rounded-lg border border-zinc-700 p-2 text-white">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-white mb-1 border-b border-zinc-800 pb-1">
              <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> Bridged ISL Interpreter</span>
              <span className="text-zinc-500">#INT-104</span>
            </div>
            <div className="w-full h-28 bg-zinc-900 rounded border border-zinc-800 flex flex-col items-center justify-center text-center p-2">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center mb-1">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs font-bold text-white">Ananya M.</p>
              <p className="text-[10px] text-zinc-400 font-mono">
                Level-3 Certified Interpreter
              </p>
            </div>
          </div>
        )}


      </div>

      {/* Video Panel Footer */}
      <div className="p-2.5 bg-zinc-900 border-t border-zinc-800 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-400">Active Checkpoint:</span>
          <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded font-mono font-bold">
            {currentStepLabel}
          </span>
        </div>

        <button
          onClick={() => {
            if (canvasRef.current) {
              const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.9);
              onCaptureSnapshot?.(dataUrl);
            }
          }}
          className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-medium text-xs text-white flex items-center gap-1.5 transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-zinc-400" />
          <span>Capture Frame</span>
        </button>
      </div>

      <TemplateRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        registerFrameHandler={handleRegisterFrameHandler}
      />
    </div>
  );
};
