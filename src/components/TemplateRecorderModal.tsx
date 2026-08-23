import React, { useState, useEffect, useRef } from "react";
import { encodeNpy } from "../lib/dtwEngine";
import { Camera, X, CheckCircle2, AlertCircle } from "lucide-react";

interface TemplateRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  registerFrameHandler: (handler: ((frame: Float32Array) => void) | null) => void;
}

const TEMPLATES_PER_CLASS = 10;
const MAX_FRAMES = 40;
const COUNTDOWN_SECONDS = 2;

export const TemplateRecorderModal: React.FC<TemplateRecorderModalProps> = ({
  isOpen,
  onClose,
  registerFrameHandler,
}) => {
  const [gestureName, setGestureName] = useState("");
  const [state, setState] = useState<'IDLE' | 'COUNTDOWN' | 'RECORDING' | 'SAVED' | 'DONE'>('IDLE');
  const [recordedCount, setRecordedCount] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [lastSavedFile, setLastSavedFile] = useState("");

  const framesRef = useRef<Float32Array[]>([]);
  const stateRef = useRef(state);
  // BUG 1 FIX: Mirror recordedCount in a ref so saveTemplate always reads the latest value
  const recordedCountRef = useRef(0);
  // BUG 2 FIX: Synchronous guard to prevent frames from arriving after MAX_FRAMES hit
  const savingRef = useRef(false);
  // BUG 3 FIX: Separate refs for the countdown interval and the delay timeout
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Keep refs in sync
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    recordedCountRef.current = recordedCount;
  }, [recordedCount]);

  // BUG 4 FIX: Reset all state when modal closes (isOpen goes false)
  useEffect(() => {
    if (!isOpen) {
      // Clean up timers
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
      // Reset all state
      setState('IDLE');
      setRecordedCount(0);
      setFrameCount(0);
      setCountdown(0);
      setLastSavedFile("");
      framesRef.current = [];
      savingRef.current = false;
      // Detach frame handler
      registerFrameHandler(null);
    }
  }, [isOpen, registerFrameHandler]);

  // Handle incoming frames from VideoPanel
  useEffect(() => {
    if (state === 'RECORDING') {
      savingRef.current = false; // Reset guard when entering RECORDING
      registerFrameHandler((frame: Float32Array) => {
        // BUG 2 FIX: Bail immediately if we've already hit MAX_FRAMES
        if (savingRef.current) return;

        // Must copy the frame because the ring buffer recycles Float32Arrays!
        framesRef.current.push(new Float32Array(frame));
        setFrameCount(framesRef.current.length);

        if (framesRef.current.length >= MAX_FRAMES) {
          // BUG 2 FIX: Set guard SYNCHRONOUSLY before async setState
          savingRef.current = true;
          setState('SAVED');
          saveTemplate();
        }
      });
    } else {
      registerFrameHandler(null);
    }
    return () => registerFrameHandler(null);
  }, [state, registerFrameHandler]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    };
  }, []);

  const saveTemplate = async () => {
    try {
      const framesToSave = framesRef.current;

      // BUG 5 FIX: Guard against empty frame arrays
      if (framesToSave.length === 0) {
        console.warn("[TemplateRecorder] saveTemplate called with 0 frames, skipping.");
        setState('IDLE');
        return;
      }

      // BUG 1 FIX: Read from ref instead of stale closure variable
      const currentCount = recordedCountRef.current;
      const num = (currentCount + 1).toString().padStart(2, "0");
      const filename = `reference_${gestureName.toLowerCase().replace(/ /g, "_")}_${num}.npy`;
      
      const npyData = encodeNpy(framesToSave);
      
      const res = await fetch(`/api/templates/${filename}`, {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: npyData,
      });

      if (res.ok) {
        setLastSavedFile(filename);
        setRecordedCount((prev) => {
          const next = prev + 1;
          if (next >= TEMPLATES_PER_CLASS) {
            setState('DONE');
          } else {
            // BUG 3 FIX: Use delayTimerRef (setTimeout) — cleared with clearTimeout
            delayTimerRef.current = setTimeout(() => {
              setState('COUNTDOWN');
              startCountdown(0.5);
            }, 500);
          }
          return next;
        });
      } else {
        console.error("Failed to save template");
        setState('IDLE');
      }
    } catch (err) {
      console.error(err);
      setState('IDLE');
    }
  };

  const startCountdown = (duration: number = COUNTDOWN_SECONDS) => {
    // BUG 3 FIX: Clear both timer types correctly
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }

    let timeLeft = duration;
    setCountdown(timeLeft);
    countdownTimerRef.current = setInterval(() => {
      timeLeft -= 0.1;
      setCountdown(Math.max(0, timeLeft));
      if (timeLeft <= 0) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        framesRef.current = []; // Clear buffer
        setFrameCount(0);
        setState('RECORDING');
      }
    }, 100);
  };

  const handleStart = () => {
    if (!gestureName.trim()) return;
    setRecordedCount(0);
    setState('COUNTDOWN');
    startCountdown();
  };

  const handleCancel = () => {
    // BUG 3 FIX: Clear both timer types with correct functions
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    setState('IDLE');
    setRecordedCount(0);
    framesRef.current = [];
    savingRef.current = false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-[400px] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Camera className="w-5 h-5 text-sky-400" />
            Sign Record Mode (In-Browser)
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="bg-sky-500/10 border border-sky-500/20 rounded p-3 text-xs text-sky-200 leading-relaxed">
            Recording directly in the browser ensures the extracted features perfectly match the live recognition model, eliminating sync bugs.
          </div>

          <div>
            <label className="text-xs font-mono text-zinc-400 block mb-1">Gesture Name (e.g. hello)</label>
            <input
              type="text"
              value={gestureName}
              onChange={(e) => setGestureName(e.target.value)}
              disabled={state !== 'IDLE' && state !== 'DONE'}
              className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-sky-500 disabled:opacity-50"
            />
          </div>

          <div className="h-24 flex items-center justify-center bg-zinc-950 rounded-lg border border-zinc-800 relative overflow-hidden">
            {state === 'IDLE' && (
              <span className="text-zinc-500 text-sm font-mono">Ready to record {TEMPLATES_PER_CLASS} variations.</span>
            )}
            
            {state === 'COUNTDOWN' && (
              <div className="text-center">
                <div className="text-amber-500 text-3xl font-black">{countdown.toFixed(1)}s</div>
                <div className="text-amber-500/60 text-[10px] uppercase font-bold tracking-widest mt-1">Get Ready</div>
              </div>
            )}
            
            {state === 'RECORDING' && (
              <div className="text-center w-full px-4">
                <div className="text-red-500 font-bold uppercase tracking-widest animate-pulse flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  Recording
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${(frameCount / MAX_FRAMES) * 100}%` }} />
                </div>
              </div>
            )}

            {state === 'SAVED' && (
              <div className="text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-1" />
                <div className="text-green-400 text-xs font-mono">Saved {lastSavedFile}</div>
              </div>
            )}

            {state === 'DONE' && (
              <div className="text-center">
                <CheckCircle2 className="w-8 h-8 text-sky-400 mx-auto mb-1" />
                <div className="text-sky-400 text-sm font-bold">All {TEMPLATES_PER_CLASS} Variations Saved!</div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-zinc-400 font-mono">
              Progress: <strong className="text-white">{recordedCount}/{TEMPLATES_PER_CLASS}</strong>
            </span>
            
            {state === 'IDLE' || state === 'DONE' ? (
              <button
                onClick={handleStart}
                disabled={!gestureName.trim()}
                className="bg-sky-500 hover:bg-sky-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold px-4 py-2 rounded text-sm transition-colors"
              >
                {state === 'DONE' ? "Record Another" : "Start Auto-Batch"}
              </button>
            ) : (
              <button
                onClick={handleCancel}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold px-4 py-2 rounded text-sm transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
