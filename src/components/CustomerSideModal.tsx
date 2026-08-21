import React, { useEffect, useState } from "react";
import { X, RefreshCw, Video, User, ShieldCheck } from "lucide-react";

interface CustomerSideModalProps {
  isOpen: boolean;
  onClose: () => void;
  reSignFieldLabel: string | null;
  livenessCode: string;
  isLivenessStep: boolean;
  customerName: string;
}

export const CustomerSideModal: React.FC<CustomerSideModalProps> = ({
  isOpen,
  onClose,
  reSignFieldLabel,
  livenessCode,
  isLivenessStep,
  customerName,
}) => {
  const [showReSignNotice, setShowReSignNotice] = useState(false);

  useEffect(() => {
    if (reSignFieldLabel) {
      setShowReSignNotice(true);
      const t = setTimeout(() => {
        setShowReSignNotice(false);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [reSignFieldLabel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-xl w-full text-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-200">
            <Video className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">CUSTOMER CALL VIEW (SIMULATION)</span>
            <span className="text-zinc-500">• Plain Video Session</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Canvas Simulation */}
        <div className="relative bg-zinc-950 border-b border-zinc-800 h-80 flex flex-col items-center justify-center p-4">
          {/* Plain customer feed */}
          <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 shadow-inner">
            <User className="w-12 h-12 text-zinc-400" />
          </div>
          <p className="font-bold text-sm text-white">{customerName}</p>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Indus Apex Video Call Stream
          </p>

          {/* RE-SIGN PROMPT OVERLAY */}
          {showReSignNotice && (
            <div className="absolute top-4 inset-x-6 bg-amber-500 text-zinc-950 px-4 py-2.5 rounded-lg shadow-lg flex items-center justify-between z-20 animate-bounce">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider">
                    PLEASE SIGN AGAIN
                  </p>
                  <p className="text-xs font-medium">
                    The bank official requested a re-sign for:{" "}
                    <strong>{reSignFieldLabel}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReSignNotice(false)}
                className="text-xs font-bold underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* LIVENESS CODE DISPLAY */}
          {isLivenessStep && (
            <div className="absolute bottom-4 inset-x-6 bg-zinc-900/90 border border-amber-500/80 p-3 rounded-lg text-center z-20 shadow-lg backdrop-blur-sm">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold block mb-1">
                LIVENESS VERIFICATION CODE — SIGN THESE DIGITS IN ORDER
              </span>
              <div className="flex justify-center gap-3 font-mono font-bold text-2xl text-amber-300 py-1">
                {livenessCode.split("").map((digit, i) => (
                  <span
                    key={i}
                    className="w-10 h-12 bg-amber-950/60 border border-amber-700/80 rounded flex items-center justify-center shadow-inner"
                  >
                    {digit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-zinc-950/80 border-t border-zinc-800 text-[11px] text-zinc-400 font-mono flex justify-between items-center">
          <span>Customer Interface: Zero-AI Plain WebRTC Video</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> End-to-End Encrypted
          </span>
        </div>
      </div>
    </div>
  );
};
