import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  Activity,
  Radio,
  User,
  CheckCircle2,
  UserCheck,
  RefreshCw,
  Eye,
  Zap,
} from "lucide-react";
import { DemoState } from "../types";
import {
  initHolisticLandmarker,
  detectHolistic,
  extractHolisticFeatureVector,
  isBodyDetected,
  closeHolisticLandmarker,
  HAND_CONNECTIONS,
  POSE_UPPER_BODY_CONNECTIONS,
  type HolisticResult,
} from "../lib/holisticLandmarker";
import {
  loadTemplates,
  pushFrame,
  matchGesture,
  getBufferFill,
  getTemplateCount,
  getTemplateNames,
  type MatchResult,
} from "../lib/dtwEngine";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

interface VideoPanelProps {
  demoState: DemoState;
  livenessCode: string;
  recordingDuration: string;
  customerName: string;
  customerAadhaar: string;
  onCaptureSnapshot?: () => void;
  onTriggerLiveness?: () => void;
  currentStepLabel: string;
  isLivenessMatchConfirmed?: boolean;
  onGestureRecognized?: (gesture: string, distance: number, confidence: number) => void;
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
  onGestureRecognized,
}) => {
  const [useWebcam, setUseWebcam] = useState(false);
  const [showMesh, setShowMesh] = useState(true);
  const [modelReady, setModelReady] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);
  const [lastMatch, setLastMatch] = useState<MatchResult | null>(null);
  const [handVisible, setHandVisible] = useState(false);
  const [bufferFill, setBufferFill] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  // Performance & Throttling refs
  const lastExtractionTimeRef = useRef(0);
  const lastResultRef = useRef<HolisticResult | null>(null);
  const lastFeatureVecRef = useRef<Float32Array | null>(null);
  const handVisibleRef = useRef(false);
  const bufferFillRef = useRef(0);
  const lastUiFlushRef = useRef(0);
  const dtwCooldown = useRef(0);

  // â”€â”€â”€ Initialize MediaPipe + Load Templates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const initModel = useCallback(async () => {
    if (modelReady || modelLoading) return;
    setModelLoading(true);
    try {
      await initHolisticLandmarker();
      setModelReady(true);
      console.log("[VideoPanel] HolisticLandmarker initialized");
    } catch (err) {
      console.error("[VideoPanel] Failed to init HolisticLandmarker:", err);
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
        // Start model init in parallel with camera
        initModel();
        initTemplates();

        const constraints = { video: { width: 1280, height: 720, frameRate: { ideal: 30, max: 30 } } };
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
          videoRef.current.play();
        }
        setUseWebcam(true);
      } catch (err) {
        console.error("[VideoPanel] Camera access failed:", err);
        setUseWebcam(false);
      }
    } else {
      // Stop webcam
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

  // â”€â”€â”€ Auto-start Webcam on Mount â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    let mounted = true;
    if (!useWebcam) {
      toggleWebcam().catch(err => console.error("Auto-start failed", err));
    }
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // â”€â”€â”€ Draw Real Landmarks on Canvas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

      // Helper to draw a set of landmarks
      const drawPart = (
        landmarks: NormalizedLandmark[],
        connections: [number, number][],
        baseColor: string,
        isHand: boolean,
        label: string
      ) => {
        if (!landmarks || landmarks.length === 0) return;

        const pts = landmarks.map((lm) => ({
          x: lm.x * width,
          y: lm.y * height,
        }));

        // Connections
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        for (const [from, to] of connections) {
          if (from < pts.length && to < pts.length) {
            ctx.moveTo(pts[from].x, pts[from].y);
            ctx.lineTo(pts[to].x, pts[to].y);
          }
        }
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // Dots
        for (let i = 0; i < pts.length; i++) {
          const isKey = isHand ? KEY_LANDMARKS.has(i) : false; // for hand use KEY, for pose don't highlight
          const radius = isKey ? 6 : 4;
          const color = isKey ? keyDotColor : baseColor;

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(pts[i].x, pts[i].y, radius, 0, 2 * Math.PI);
          ctx.fill();

          if (isKey) {
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(pts[i].x, pts[i].y, radius + 1, 0, 2 * Math.PI);
            ctx.stroke();
          }
        }

        // Bounding box
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const p of pts) {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        }
        const pad = 14;
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.6;
        ctx.strokeRect(minX - pad, minY - pad, (maxX - minX) + pad * 2, (maxY - minY) + pad * 2);
        ctx.globalAlpha = 1.0;

        // Label
        ctx.font = "11px monospace";
        ctx.fillStyle = baseColor;
        ctx.fillText(label, minX - pad, minY - pad - 6);
      };

      if (result.pose) {
        drawPart(result.pose, POSE_UPPER_BODY_CONNECTIONS, strokeColor, false, "Upper Body");
      }
      if (result.leftHand) {
        drawPart(result.leftHand, HAND_CONNECTIONS, "#00E5FF", true, "Left Hand");
      }
      if (result.rightHand) {
        drawPart(result.rightHand, HAND_CONNECTIONS, "#FF9100", true, "Right Hand");
      }
    },
    [showMesh, demoState]
  );

  // â”€â”€â”€ Detection + DTW Loop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      }

      const ctx = canvas.getContext("2d", { willReadFrequently: false });
      if (!ctx) {
        animFrameRef.current = requestAnimationFrame(runDetection);
        return;
      }

      const now = performance.now();
      const EXTRACTION_INTERVAL_MS = 1000 / 15; // 15 FPS extraction

      // Throttle AI extraction (decoupled from render rate)
      if (now - lastExtractionTimeRef.current >= EXTRACTION_INTERVAL_MS) {
        const t0 = performance.now();

        // 1. Detect pose + hands
        const result = detectHolistic(video);

        // 2. Extract feature vector
        const featureVec = extractHolisticFeatureVector(result);
        const detected = isBodyDetected(featureVec);
        
        lastResultRef.current = result;
        lastFeatureVecRef.current = featureVec;
        handVisibleRef.current = detected;

        // 3. Push to DTW buffer and attempt match
        if (dtwCooldown.current > 0) dtwCooldown.current--;

        if (detected) {
          pushFrame(featureVec);
          bufferFillRef.current = getBufferFill();

          const match = matchGesture();
          if (match.gesture) {
            setLastMatch(match);
            dtwCooldown.current = 45;
            onGestureRecognized?.(match.gesture, match.distance, match.confidence);
          }
        } else {
          bufferFillRef.current = getBufferFill();
        }

        const t1 = performance.now();
        // Step 1: Log TPF (Time Per Frame for AI extraction) occasionally (1% of frames)
        if (Math.random() < 0.01) {
          console.log(`[Profiler] AI Extraction TPF: ${(t1 - t0).toFixed(1)}ms`);
        }

        lastExtractionTimeRef.current = now;
      }

      // 4. Always render at 60fps using last known data
      if (lastResultRef.current && handVisibleRef.current) {
        drawLandmarks(ctx, lastResultRef.current, canvas.width, canvas.height);
      } else if (!showMesh) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Throttled UI state flush (~5Hz)
      if (now - lastUiFlushRef.current > 200) {
        lastUiFlushRef.current = now;
        setHandVisible(handVisibleRef.current);
        setBufferFill(bufferFillRef.current);
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
  }, [useWebcam, modelReady, drawLandmarks, onGestureRecognized, showMesh]);

  // â”€â”€â”€ Cleanup on unmount â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      closeHolisticLandmarker();
    };
  }, []);


  // â”€â”€â”€ Recognition Banner State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [showRecognitionBanner, setShowRecognitionBanner] = useState(false);
  useEffect(() => {
    if (lastMatch?.gesture) {
      setShowRecognitionBanner(true);
      const timer = setTimeout(() => setShowRecognitionBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastMatch]);

  return (
    <div className="col-span-12 lg:col-span-7 flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden relative">
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
            <div className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              modelReady
                ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                : "bg-zinc-800 text-zinc-400 border-zinc-700"
            }`}>
              <Zap className="w-3 h-3" />
              {modelLoading ? "MediaPipe Lite is Loading..." : modelReady ? "MediaPipe Active" : "AI Standby"}
            </div>
          )}
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMesh(!showMesh)}
            className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 transition-colors ${
              showMesh
                ? "bg-zinc-800 border-zinc-600 text-white font-bold"
                : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{showMesh ? "Landmarks On" : "Landmarks Off"}</span>
          </button>

          <button
            onClick={toggleWebcam}
            className={`px-2.5 py-1 rounded text-xs font-medium border flex items-center gap-1 transition-colors ${
              useWebcam
                ? "bg-sky-500/10 border-sky-500/30 text-sky-400 font-bold"
                : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{useWebcam ? "Webcam Active" : "Use Camera"}</span>
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="relative flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${useWebcam ? 'block' : 'hidden'}`}
          style={{ transform: "scaleX(-1)" }}
        />
        {!useWebcam && (
          <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-500">
            <p className="z-10 text-[10px] text-zinc-400 uppercase tracking-wider font-mono bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800 font-bold backdrop-blur-sm">
              Live WebRTC Stream â€” Customer View
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

        {/* DTW Buffer + Hand Status (bottom-left overlay when webcam active) */}
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
                  style={{ width: `${(bufferFill / 30) * 100}%` }}
                />
              </div>
              <span className="text-zinc-400">{bufferFill}/30</span>
            </div>
            {templatesLoaded && (
              <div className="text-[10px] font-mono text-zinc-500">
                Templates: {getTemplateCount()} ({getTemplateNames().join(", ")})
              </div>
            )}
          </div>
        )}

        {/* DTW Recognition Banner (center overlay) */}
        {showRecognitionBanner && lastMatch?.gesture && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <div className="bg-zinc-900 text-white font-black text-sm px-6 py-3 rounded-xl border border-zinc-700 flex items-center gap-3 uppercase tracking-wider shadow-lg animate-pulse">
              <CheckCircle2 className="w-6 h-6 text-white" />
              <div>
                <div className="text-base">GESTURE: {lastMatch.gesture.toUpperCase()}</div>
                <div className="text-[10px] font-mono font-normal opacity-80 text-zinc-400">
                  DTW: {lastMatch.distance.toFixed(2)} | Confidence: {lastMatch.confidence}%
                </div>
              </div>
            </div>
          </div>
        )}

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
              {livenessCode.split("").map((digit, idx) => (
                <div
                  key={idx}
                  className="w-12 h-14 rounded bg-zinc-950 text-white font-mono font-bold text-2xl flex items-center justify-center border border-zinc-700"
                >
                  {digit}
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-white font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                Signed Sequence Matches Prompt
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

        {/* LIVENESS MATCH INDICATOR */}
        {(demoState === "liveness_code_step" || isLivenessMatchConfirmed) && !showRecognitionBanner && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <div className="bg-white text-black font-black text-sm px-4 py-2 rounded-lg border-2 border-white flex items-center gap-2 uppercase tracking-wider">
              <CheckCircle2 className="w-5 h-5 text-black" />
              <span>MATCH CONFIRMED</span>
            </div>
          </div>
        )}

        {/* INTERPRETER TILE */}
        {demoState === "low_confidence_or_escalated" && (
          <div className="absolute bottom-3 right-3 z-20 w-60 h-40 bg-zinc-950 rounded-lg border border-zinc-700 p-2 text-white">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-white mb-1 border-b border-zinc-800 pb-1">
              <span className="flex items-center gap-1"><UserCheck className="w-3 h-3"/> Bridged ISL Interpreter</span>
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
          onClick={onCaptureSnapshot}
          className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-medium text-xs text-white flex items-center gap-1.5 transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-zinc-400" />
          <span>Capture Frame</span>
        </button>
      </div>
    </div>
  );
};
