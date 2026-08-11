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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-none flex items-center justify-center p-4">
      <div className="bg-white border border-gray-300 rounded-lg max-w-xl w-full text-gray-900 shadow-none overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-gray-800">
            <Video className="w-4 h-4 text-green-600" />
            <span className="font-bold">CUSTOMER CALL VIEW (SIMULATION)</span>
            <span className="text-gray-500">• Plain Video Session</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Canvas Simulation */}
        <div className="relative bg-gray-50 border-b border-gray-200 h-80 flex flex-col items-center justify-center p-4">
          {/* Plain customer feed */}
          <div className="w-24 h-24 rounded-full bg-white border border-gray-300 flex items-center justify-center mb-3">
            <User className="w-12 h-12 text-gray-600" />
          </div>
          <p className="font-bold text-sm text-gray-900">{customerName}</p>
          <p className="text-xs text-gray-500 font-mono mt-1">
            Indus Apex Video Call Stream
          </p>

          {/* RE-SIGN PROMPT OVERLAY */}
          {showReSignNotice && (
            <div className="absolute top-4 inset-x-6 bg-amber-500 text-gray-950 px-4 py-2.5 rounded shadow-none flex items-center justify-between z-20 animate-bounce">
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
                className="text-xs font-bold underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* LIVENESS CODE DISPLAY */}
          {isLivenessStep && (
            <div className="absolute bottom-4 inset-x-6 bg-white border border-amber-500 p-3 rounded text-center z-20">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold block mb-1">
                LIVENESS VERIFICATION CODE — SIGN THESE DIGITS IN ORDER
              </span>
              <div className="flex justify-center gap-3 font-mono font-bold text-2xl text-amber-900 py-1">
                {livenessCode.split("").map((digit, i) => (
                  <span
                    key={i}
                    className="w-10 h-12 bg-amber-50 border border-amber-300 rounded flex items-center justify-center"
                  >
                    {digit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-600 font-mono flex justify-between items-center">
          <span>Customer Interface: Zero-AI Plain WebRTC Video</span>
          <span className="text-green-700 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600" /> End-to-End Encrypted
          </span>
        </div>
      </div>
    </div>
  );
};
