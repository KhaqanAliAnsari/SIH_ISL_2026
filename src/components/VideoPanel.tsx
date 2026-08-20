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

  // ─── Initialize MediaPipe + Load Templates ────────────────────────
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

  // ─── Auto-start Webcam on Mount ────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    if (!useWebcam) {
      toggleWebcam().catch(err => console.error("Auto-start failed", err));
    }
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Draw Real Landmarks on Canvas ─────────────────────────────────
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

  // ─── Detection + DTW Loop ──────────────────────────────────────────
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

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        animFrameRef.current = requestAnimationFrame(runDetection);
        return;
      }

      // 1. Detect pose + hands
      const result = detectHolistic(video);

      // 2. Extract feature vector
      const featureVec = extractHolisticFeatureVector(result);
      const detected = isBodyDetected(featureVec);
      setHandVisible(detected);

      // 3. Draw landmarks on canvas
      drawLandmarks(ctx, result, canvas.width, canvas.height);

      // 4. Push to DTW buffer and attempt match
      if (detected) {
        pushFrame(featureVec);
        setBufferFill(getBufferFill());

        const result = matchGesture();
        if (result.gesture) {
          setLastMatch(result);
          onGestureRecognized?.(result.gesture, result.distance, result.confidence);
        }
      } else {
        setBufferFill(getBufferFill());
        // Clear canvas when no mesh and no hand
        if (!showMesh) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
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

  // ─── Cleanup on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      closeHolisticLandmarker();
    };
  }, []);

<<<<<<< Updated upstream
  // ─── Fallback: Animated skeleton when webcam is OFF ────────────────
  useEffect(() => {
    if (useWebcam) return; // Real detection handles canvas when webcam is on

    let animId: number;
    let frame = 0;

    const renderFakeLandmarks = () => {
      frame++;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (!showMesh) {
        animId = requestAnimationFrame(renderFakeLandmarks);
        return;
      }

      const strokeColor = demoState === "low_confidence_or_escalated" ? "#D97706" : "#0284C7";
      const dotColor = demoState === "low_confidence_or_escalated" ? "#D97706" : "#0284C7";

      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = dotColor;
      ctx.lineWidth = 1.5;

      const centerX = width * 0.5;
      const headY = height * 0.28;
      const shoulderY = height * 0.45;

      ctx.beginPath();
      ctx.ellipse(centerX, headY, width * 0.09, height * 0.12, 0, 0, 2 * Math.PI);
      ctx.stroke();

      const eyeOffset = width * 0.03;
      ctx.beginPath();
      ctx.arc(centerX - eyeOffset, headY - 8, 2.5, 0, 2 * Math.PI);
      ctx.arc(centerX + eyeOffset, headY - 8, 2.5, 0, 2 * Math.PI);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(centerX - width * 0.2, shoulderY);
      ctx.lineTo(centerX + width * 0.2, shoulderY);
      ctx.stroke();

      const swingX = Math.sin(frame * 0.05) * 25;
      const swingY = Math.cos(frame * 0.06) * 15;

      const wristX = centerX + width * 0.14 + swingX;
      const wristY = headY + 55 - swingY * 0.8;

      const points: { x: number; y: number }[] = new Array(21);
      points[0] = { x: wristX, y: wristY };

      const fingerBases = [
        { dx: -22, dy: -20, flex: 0.8 },
        { dx: -12, dy: -35, flex: 1.0 },
        { dx: 0, dy: -42, flex: 1.1 },
        { dx: 11, dy: -38, flex: 1.0 },
        { dx: 20, dy: -28, flex: 0.85 },
      ];

      let ptIdx = 1;
      fingerBases.forEach((f, fIdx) => {
        let currX = wristX + f.dx;
        let currY = wristY + f.dy;
        points[ptIdx++] = { x: currX, y: currY };
        for (let j = 0; j < 3; j++) {
          const wave = Math.sin(frame * 0.08 + fIdx + j) * 4;
          currX += (f.dx / 2.5) + wave;
          currY -= (12 * f.flex);
          points[ptIdx++] = { x: currX, y: currY };
        }
      });

      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
        [5, 9], [9, 13], [13, 17],
      ];

      ctx.beginPath();
      connections.forEach(([from, to]) => {
        ctx.moveTo(points[from].x, points[from].y);
        ctx.lineTo(points[to].x, points[to].y);
      });
      ctx.stroke();

      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      points.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });

      const pad = 12;
      ctx.strokeRect(minX - pad, minY - pad, (maxX - minX) + pad * 2, (maxY - minY) + pad * 2);

      ctx.font = "10px monospace";
      ctx.fillText(
        demoState === "low_confidence_or_escalated"
          ? "Holistic [62% Match]"
          : `Holistic [X:${Math.round(minX - pad)} Y:${Math.round(minY - pad)}]`,
        minX - pad - 5,
        minY - pad - 6
      );

      animId = requestAnimationFrame(renderFakeLandmarks);
    };

    animId = requestAnimationFrame(renderFakeLandmarks);
    return () => cancelAnimationFrame(animId);
  }, [useWebcam, showMesh, demoState]);
=======
  // Fake skeleton removed per user request
>>>>>>> Stashed changes

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
    <div className="col-span-12 lg:col-span-7 flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden relative">
      {/* Video Overlay Top Header */}
      <div className="absolute top-0 left-0 right-0 px-3 py-2 bg-zinc-900/95 text-white z-20 flex items-center justify-between border-b border-zinc-800 shadow-none">
        {/* Record Indicator */}
        <div className="flex items-center gap-3">
<<<<<<< Updated upstream
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-300 px-2 py-0.5 rounded text-red-700 font-mono text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span>REC</span>
            <span>{recordingDuration}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-700 font-mono font-semibold">
            <Radio className="w-3.5 h-3.5 text-green-600" />
            <span>1080p • 30 FPS Feed</span>
=======
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-white font-mono text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>REC {recordingDuration}</span>
            <span className="text-zinc-600 mx-1">|</span>
            <span className="text-[10px] text-zinc-400">1080p 30FPS</span>
>>>>>>> Stashed changes
          </div>

          {/* Model Status Indicator */}
          {useWebcam && (
            <div className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              modelReady
                ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                : "bg-zinc-800 text-zinc-400 border-zinc-700"
            }`}>
              <Zap className="w-3 h-3" />
              {modelLoading ? "Loading AI..." : modelReady ? "MediaPipe Active" : "AI Standby"}
            </div>
          )}
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
<<<<<<< Updated upstream
          <button
            onClick={() => setShowMesh(!showMesh)}
            className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 transition-colors ${
              showMesh
                ? "bg-gray-100 border-gray-300 text-gray-900 font-bold"
                : "bg-white border-gray-200 text-gray-500 hover:text-gray-800"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{showMesh ? "Landmarks On" : "Landmarks Off"}</span>
          </button>

          <button
            onClick={toggleWebcam}
            className={`px-2.5 py-1 rounded text-xs font-medium border flex items-center gap-1 transition-colors ${
              useWebcam
                ? "bg-green-50 border-green-400 text-green-800 font-bold"
                : "border-gray-300 bg-white hover:bg-gray-100 text-gray-800"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{useWebcam ? "Webcam Active" : "Use Camera"}</span>
          </button>
=======
          {/* STOP Gesture Config Badge/Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStopConfig(!showStopConfig);
                setShowSettings(false);
              }}
              className="px-2 py-1 rounded text-xs font-mono border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white flex items-center gap-1 transition-colors"
              title="Configure which sign acts as the sentence STOP delimiter"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span>STOP: <strong className="uppercase">{activeStopGesture}</strong></span>
            </button>

            {showStopConfig && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl p-3 z-50 text-xs text-white">
                <div className="font-bold text-white mb-1 flex items-center justify-between">
                  <span>Configure STOP Gesture</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Sign delimiter</span>
                </div>
                <p className="text-[11px] text-zinc-500 mb-2 leading-tight">
                  Choose which sign ends a sentence and merges letters into words:
                </p>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 block mb-0.5">Gesture Name:</label>
                    <input
                      type="text"
                      value={activeStopGesture}
                      onChange={(e) => {
                        setActiveStopGesture(e.target.value);
                        setStopGestureName(e.target.value);
                      }}
                      placeholder="e.g. stop, period, halt"
                      className="w-full px-2 py-1 border border-zinc-700 bg-zinc-900 rounded font-mono text-xs text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>

                  {getTemplateNames().length > 0 && (
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 block mb-0.5">Or Pick from Loaded Signs:</label>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar">
                        {getTemplateNames().map((name) => (
                          <button
                            key={name}
                            onClick={() => {
                              setActiveStopGesture(name);
                              setStopGestureName(name);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                              activeStopGesture === name
                                ? "bg-white text-black border-white font-bold"
                                : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800"
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
                      className="px-2 py-1 bg-white hover:bg-zinc-200 text-black rounded text-[10px] font-bold transition-colors"
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
              <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl p-2 z-50 flex flex-col gap-2">
                <button
                  onClick={() => setShowMesh(!showMesh)}
                  className={`w-full px-2 py-1.5 rounded text-xs font-medium border flex items-center gap-2 transition-colors ${
                    showMesh
                      ? "bg-zinc-800 border-zinc-600 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>{showMesh ? "Landmarks On" : "Landmarks Off"}</span>
                </button>

                <button
                  onClick={toggleWebcam}
                  className={`w-full px-2 py-1.5 rounded text-xs font-medium border flex items-center gap-2 transition-colors ${
                    useWebcam
                      ? "bg-white border-white text-black font-bold"
                      : "bg-zinc-950 border-zinc-700 text-white hover:bg-zinc-900"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{useWebcam ? "Webcam Active" : "Use Camera"}</span>
                </button>
              </div>
            )}
          </div>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-800">
            <div className="w-28 h-28 rounded-full bg-white border border-gray-300 flex items-center justify-center mb-3">
              <User className="w-14 h-14 text-gray-600" />
            </div>
            <p className="font-bold text-base text-gray-900">{customerName}</p>
            <p className="text-xs font-mono text-gray-600 mt-0.5">
              Aadhaar: {customerAadhaar}
            </p>
            <p className="text-[10px] text-gray-700 uppercase tracking-wider font-mono mt-2 bg-white px-2 py-0.5 rounded border border-gray-300 font-bold">
=======
          <div className="relative w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-500">
            <p className="z-10 text-[10px] text-zinc-400 uppercase tracking-wider font-mono bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800 font-bold backdrop-blur-sm">
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======

        {/* ACCUMULATOR STRIP (Bottom Center) */}
        {(currentSentenceTokens.length > 0 || sentenceEngineState === "DISPATCHING") && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-2xl bg-zinc-950 backdrop-blur-md border border-zinc-700 rounded-lg p-2.5 text-white shadow-xl transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-white" />
                  Live Sentence Buffer ({currentSentenceTokens.length} tokens)
                </span>
                <span className="text-[9px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-700">
                  STOP sign: {activeStopGesture.toUpperCase()} (or 18s idle)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {sentenceEngineState === "ACCUMULATING" && (
                  <button
                    onClick={() => manualDispatch()}
                    className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-white hover:bg-zinc-200 text-black transition-colors"
                    title="Manual trigger to phrase accumulated sentence now"
                  >
                    Phrase Now
                  </button>
                )}
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  sentenceEngineState === "DISPATCHING" ? "bg-zinc-800 text-white animate-pulse" :
                  "bg-zinc-900 text-zinc-300"
                }`}>
                  {sentenceEngineState === "DISPATCHING" ? "SENDING TO CLOUD..." : "ACCUMULATING..."}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-sm max-h-20 overflow-y-auto custom-scrollbar">
              {currentSentenceTokens.map((token, idx) => (
                <React.Fragment key={idx}>
                  <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-white shadow-sm">
                    {token.word}
                  </span>
                  {idx < currentSentenceTokens.length - 1 && (
                    <span className="text-zinc-600">→</span>
                  )}
                </React.Fragment>
              ))}
              {sentenceEngineState === "ACCUMULATING" && (
                <span className="text-white ml-1 animate-pulse font-bold">_</span>
              )}
            </div>
          </div>
        )}
>>>>>>> Stashed changes
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
