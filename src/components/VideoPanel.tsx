import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Activity,
  Radio,
  User,
  CheckCircle2,
  UserCheck,
  RefreshCw,
  Eye,
} from "lucide-react";
import { DemoState } from "../types";

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
}

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
}) => {
  const [useWebcam, setUseWebcam] = useState(false);
  const [showMesh, setShowMesh] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const toggleWebcam = async () => {
    if (!useWebcam) {
      try {
        const constraints = { video: { width: 1280, height: 720, frameRate: { ideal: 30, max: 30 } } };
        let stream: MediaStream;

        // Cross-browser compatibility check
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // Modern standard (Chrome, Edge, Firefox, Brave, Safari)
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } else {
          // Legacy fallback for older browsers
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
        setUseWebcam(false);
      }
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setUseWebcam(false);
    }
  };


  useEffect(() => {
    let animId: number;
    let frame = 0;

    const renderLandmarks = () => {
      frame++;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (!showMesh) {
        animId = requestAnimationFrame(renderLandmarks);
        return;
      }

      // 21-point hand tracking landmarks (#0284C7 color, 1.5px vector lines, 3px solid dots)
      const strokeColor = demoState === "low_confidence_or_escalated" ? "#D97706" : "#0284C7";
      const dotColor = demoState === "low_confidence_or_escalated" ? "#D97706" : "#0284C7";

      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = dotColor;
      ctx.lineWidth = 1.5;

      const centerX = width * 0.5;
      const headY = height * 0.28;
      const shoulderY = height * 0.45;

      // Face tracking oval
      ctx.beginPath();
      ctx.ellipse(centerX, headY, width * 0.09, height * 0.12, 0, 0, 2 * Math.PI);
      ctx.stroke();

      const eyeOffset = width * 0.03;
      ctx.beginPath();
      ctx.arc(centerX - eyeOffset, headY - 8, 2.5, 0, 2 * Math.PI);
      ctx.arc(centerX + eyeOffset, headY - 8, 2.5, 0, 2 * Math.PI);
      ctx.fill();

      // Shoulders
      ctx.beginPath();
      ctx.moveTo(centerX - width * 0.2, shoulderY);
      ctx.lineTo(centerX + width * 0.2, shoulderY);
      ctx.stroke();

      const swingX = Math.sin(frame * 0.05) * 25;
      const swingY = Math.cos(frame * 0.06) * 15;

      // Base hand position (Wrist = Point 0)
      const wristX = centerX + width * 0.14 + swingX;
      const wristY = headY + 55 - swingY * 0.8;

      // Generate 21 keypoints for MediaPipe Hand Topology
      // 0: Wrist, 1-4: Thumb, 5-8: Index, 9-12: Middle, 13-16: Ring, 17-20: Pinky
      const points: { x: number; y: number }[] = new Array(21);
      points[0] = { x: wristX, y: wristY };

      // Finger offsets relative to wrist
      const fingerBases = [
        { dx: -22, dy: -20, flex: 0.8 }, // Thumb
        { dx: -12, dy: -35, flex: 1.0 }, // Index
        { dx: 0, dy: -42, flex: 1.1 },   // Middle
        { dx: 11, dy: -38, flex: 1.0 },  // Ring
        { dx: 20, dy: -28, flex: 0.85 }, // Pinky
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

      // Connections topology
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8],       // Index
        [0, 9], [9, 10], [10, 11], [11, 12],   // Middle
        [0, 13], [13, 14], [14, 15], [15, 16], // Ring
        [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
        [5, 9], [9, 13], [13, 17]             // Palm
      ];

      // Draw 1.5px vector lines
      ctx.beginPath();
      connections.forEach(([from, to]) => {
        ctx.moveTo(points[from].x, points[from].y);
        ctx.lineTo(points[to].x, points[to].y);
      });
      ctx.stroke();

      // Draw 3px solid dots at joints
      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Compute bounding box around 21 hand points
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      points.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });

      const pad = 12;
      const bboxX = minX - pad;
      const bboxY = minY - pad;
      const bboxW = (maxX - minX) + pad * 2;
      const bboxH = (maxY - minY) + pad * 2;

      ctx.strokeRect(bboxX, bboxY, bboxW, bboxH);

      // Bounding box annotation
      ctx.font = "10px monospace";
      ctx.fillText(
        demoState === "low_confidence_or_escalated"
          ? "21-Pt Hand [62% Match]"
          : `21-Pt Hand [X:${Math.round(bboxX)} Y:${Math.round(bboxY)} W:${Math.round(bboxW)} H:${Math.round(bboxH)}]`,
        bboxX - 5,
        bboxY - 6
      );

      animId = requestAnimationFrame(renderLandmarks);
    };

    animId = requestAnimationFrame(renderLandmarks);
    return () => cancelAnimationFrame(animId);
  }, [showMesh, demoState]);

  return (
    <div className="col-span-12 lg:col-span-7 flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden relative">
      {/* Video Overlay Top Header */}
      <div className="absolute top-0 left-0 right-0 px-3 py-2 bg-white/95 text-gray-900 z-20 flex items-center justify-between border-b border-gray-200 shadow-none">
        {/* Record Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-300 px-2 py-0.5 rounded text-red-700 font-mono text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span>REC</span>
            <span>{recordingDuration}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-700 font-mono font-semibold">
            <Radio className="w-3.5 h-3.5 text-green-600" />
            <span>1080p • 30 FPS Feed</span>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
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
            className="px-2.5 py-1 rounded text-xs font-medium border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 flex items-center gap-1 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{useWebcam ? "Webcam Active" : "Use Camera"}</span>
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="relative flex-1 bg-gray-100 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${useWebcam ? 'block' : 'hidden'}`}
        />
        {!useWebcam && (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-800">
            <div className="w-28 h-28 rounded-full bg-white border border-gray-300 flex items-center justify-center mb-3">
              <User className="w-14 h-14 text-gray-600" />
            </div>
            <p className="font-bold text-base text-gray-900">{customerName}</p>
            <p className="text-xs font-mono text-gray-600 mt-0.5">
              Aadhaar: {customerAadhaar}
            </p>
            <p className="text-[10px] text-gray-700 uppercase tracking-wider font-mono mt-2 bg-white px-2 py-0.5 rounded border border-gray-300 font-bold">
              Live WebRTC Stream — Customer View
            </p>
          </div>
        )}

        {/* AI Landmark Overlay */}
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* LIVENESS CODE PROMPT OVERLAY (High contrast, unmissable) */}
        {demoState === "liveness_code_step" && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-md bg-white border-2 border-amber-500 rounded-lg p-3 text-gray-900">
            <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-gray-200">
              <span className="font-bold text-xs uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-600" />
                LIVENESS CODE PROMPTED TO CUSTOMER
              </span>
              <span className="text-[10px] font-mono bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200 font-bold">
                Step 5/7
              </span>
            </div>

            <p className="text-gray-600 text-xs mb-2">
              Customer is requested to sign these 4 digits in exact order:
            </p>

            <div className="flex items-center justify-center gap-3 py-2 bg-gray-50 rounded border border-gray-200">
              {livenessCode.split("").map((digit, idx) => (
                <div
                  key={idx}
                  className="w-12 h-14 rounded bg-white text-amber-900 font-mono font-bold text-2xl flex items-center justify-center border border-amber-300"
                >
                  {digit}
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-green-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Signed Sequence Matches Prompt
              </span>
              <button
                onClick={onTriggerLiveness}
                className="text-gray-700 hover:text-black font-semibold underline text-[11px] flex items-center gap-1 font-mono"
              >
                <RefreshCw className="w-3 h-3" /> New Prompt
              </button>
            </div>
          </div>
        )}

        {/* LIVENESS MATCH INDICATOR — Center screen 'MATCH CONFIRMED' beat */}
        {(demoState === "liveness_code_step" || isLivenessMatchConfirmed) && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <div className="bg-green-600 text-white font-black text-sm px-4 py-2 rounded-lg border-2 border-white flex items-center gap-2 uppercase tracking-wider">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>MATCH CONFIRMED</span>
            </div>
          </div>
        )}

        {/* SECOND VIDEO TILE FOR CERTIFIED ISL INTERPRETER (when escalated) */}
        {demoState === "low_confidence_or_escalated" && (
          <div className="absolute bottom-3 right-3 z-20 w-60 h-40 bg-white rounded border-2 border-amber-500 p-2 text-gray-900">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-amber-800 mb-1 border-b border-gray-200 pb-1">
              <span>Bridged ISL Interpreter</span>
              <span>#INT-104</span>
            </div>
            <div className="w-full h-28 bg-gray-100 rounded border border-gray-200 flex flex-col items-center justify-center text-center p-2">
              <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center mb-1">
                <UserCheck className="w-6 h-6 text-amber-800" />
              </div>
              <p className="text-xs font-bold text-gray-900">Ananya M.</p>
              <p className="text-[10px] text-gray-600 font-mono">
                Level-3 Certified Interpreter
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Video Panel Footer */}
      <div className="p-2.5 bg-gray-50 border-t border-gray-200 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-700">Active Checkpoint:</span>
          <span className="px-2 py-0.5 bg-white border border-gray-300 rounded font-mono font-bold text-gray-900">
            {currentStepLabel}
          </span>
        </div>

        <button
          onClick={onCaptureSnapshot}
          className="px-3 py-1 rounded bg-white hover:bg-gray-100 border border-gray-300 font-medium text-xs text-gray-700 flex items-center gap-1.5 transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-gray-500" />
          <span>Capture Frame</span>
        </button>
      </div>
    </div>
  );
};
