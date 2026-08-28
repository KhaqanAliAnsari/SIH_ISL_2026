import React, { useState } from "react";
import {
  CheckCircle2,
  Edit3,
  UserCheck,
  Shield,
  AlertCircle,
  FileText,
  User,
  Fingerprint,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { KYCField, DemoState } from "../types";

interface AIAssistPanelProps {
  demoState: DemoState;
  fields: KYCField[];
  activeField: KYCField | null;
  onConfirmField: (fieldId: string) => void;
  onEditField: (field: KYCField) => void;
  onRequestReSign: (field: KYCField) => void;
  onEscalateToInterpreter: () => void;
  liveCaptionText: string;
  confidenceScore: number;
  livenessCode: string;
  livenessMatchIndex?: number;
}

export const AIAssistPanel: React.FC<AIAssistPanelProps> = ({
  demoState,
  fields,
  activeField,
  onConfirmField,
  onEditField,
  onRequestReSign,
  onEscalateToInterpreter,
  liveCaptionText,
  confidenceScore,
  livenessCode,
  livenessMatchIndex = 0,
}) => {
  const [isTrayOpen, setIsTrayOpen] = useState(true);

  // Confidence Meter Bands
  const getConfidenceLevel = (score: number) => {
    if (score >= 85) {
      return {
        bg: "bg-emerald-950/40",
        border: "border-emerald-800/80",
        text: "text-emerald-400",
        badge: "bg-emerald-900/60 text-emerald-300 border-emerald-700",
        bar: "bg-emerald-500",
        label: "HIGH CONFIDENCE (>85%)",
        desc: "Ready for official confirmation",
      };
    } else if (score >= 60) {
      return {
        bg: "bg-amber-950/40",
        border: "border-amber-800/80",
        text: "text-amber-400",
        badge: "bg-amber-900/60 text-amber-300 border-amber-700",
        bar: "bg-amber-500",
        label: "MODERATE CONFIDENCE (60-85%)",
        desc: "Review or request gesture re-sign",
      };
    } else {
      return {
        bg: "bg-rose-950/40",
        border: "border-rose-800/80",
        text: "text-rose-400",
        badge: "bg-rose-900/60 text-rose-300 border-rose-700",
        bar: "bg-rose-500",
        label: "LOW CONFIDENCE (<60%)",
        desc: "Escalate to Certified ISL Interpreter",
      };
    }
  };

  const conf = getConfidenceLevel(confidenceScore);

  const getFieldIcon = (label: string) => {
    if (label.toLowerCase().includes("name"))
      return <User className="w-4 h-4 text-zinc-400" />;
    if (label.toLowerCase().includes("aadhaar") || label.toLowerCase().includes("id"))
      return <Fingerprint className="w-4 h-4 text-zinc-400" />;
    if (label.toLowerCase().includes("address"))
      return <MapPin className="w-4 h-4 text-zinc-400" />;
    if (label.toLowerCase().includes("dob") || label.toLowerCase().includes("date"))
      return <Calendar className="w-4 h-4 text-zinc-400" />;
    return <FileText className="w-4 h-4 text-zinc-400" />;
  };

  const completedFields = fields.filter((f) => f.isConfirmed);

  return (
    <div className="col-span-12 lg:col-span-5 flex flex-col shrink-0 lg:shrink lg:h-full min-h-[50vh] lg:min-h-0 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden select-none text-zinc-100">
      {/* Sidebar Header */}
      <div className="p-3 bg-zinc-950/60 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
            AI Sign Translation &amp; Active Field Card
          </h2>
          <p className="text-[11px] text-zinc-400 font-mono">
            Human-in-the-Loop Official Workstation
          </p>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar">
        {/* 1. LIVE CAPTION BOX */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Live Customer ISL Translation
            </span>
            <span className="text-[10px] font-mono text-zinc-500">REAL-TIME</span>
          </div>

          <div className="bg-zinc-900/90 border border-zinc-700/80 rounded p-3 text-sm font-bold text-white leading-snug shadow-inner">
            "{liveCaptionText}"
          </div>
        </div>

        {/* 2. CONFIDENCE METER */}
        <div className={`border rounded-lg p-3 ${conf.bg} ${conf.border}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Recognition Confidence Score
            </span>
            <span
              className={`text-sm font-black font-mono px-2 py-0.5 rounded border ${conf.badge}`}
            >
              {confidenceScore}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-zinc-800 h-2 rounded overflow-hidden mb-1.5 border border-zinc-700/60">
            <div
              className={`h-full ${conf.bar} transition-all duration-300`}
              style={{ width: `${confidenceScore}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-300 font-medium">
            <span className={conf.text}>{conf.label}</span>
            <span className="text-[11px] text-zinc-400">{conf.desc}</span>
          </div>
        </div>

        {/* 3. ACTIVE FIELD CARD */}
        {demoState === "liveness_code_step" ? (
          /* LIVENESS RESPONSE PANEL VARIANT */
          <div className="bg-zinc-950 border-2 border-amber-500/80 rounded-lg p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-400" />
                Liveness Gesture Response Panel
              </span>
              <span className="text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded font-bold">
                Active Step 5/7
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Real-time digit sequence verification:
            </p>

            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded">
              <span className="text-xs text-zinc-500 font-mono block mb-2 text-center">
                Expected Sequence
              </span>
              <div className="flex items-center justify-center gap-2">
                {livenessCode.split("").map((digit, idx) => {
                  const isMatched = idx < livenessMatchIndex;
                  const isActive = idx === livenessMatchIndex && livenessMatchIndex < livenessCode.length;
                  return (
                    <React.Fragment key={idx}>
                      {idx > 0 && (
                        <span className={`text-lg ${isMatched ? 'text-emerald-500' : 'text-zinc-600'}`}>→</span>
                      )}
                      <span className={`font-mono font-bold text-xl w-8 h-8 flex items-center justify-center rounded transition-all duration-300 ${
                        isMatched
                          ? 'text-emerald-400 bg-emerald-950 border border-emerald-600'
                          : isActive
                            ? 'text-amber-300 bg-amber-950 border border-amber-600 animate-pulse'
                            : 'text-zinc-500 bg-zinc-950 border border-zinc-700'
                      }`}>
                        {digit}
                      </span>
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="text-center mt-2">
                <span className={`text-[10px] font-mono font-bold ${
                  livenessMatchIndex >= livenessCode.length ? 'text-emerald-400' : 'text-zinc-500'
                }`}>
                  {livenessMatchIndex >= livenessCode.length
                    ? '✓ ALL DIGITS VERIFIED'
                    : `${livenessMatchIndex}/${livenessCode.length} DIGITS MATCHED`
                  }
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => onConfirmField("5")}
                disabled={livenessMatchIndex < livenessCode.length}
                className={`w-full font-bold text-xs py-2.5 px-4 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm ${
                  livenessMatchIndex >= livenessCode.length
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{livenessMatchIndex >= livenessCode.length ? 'Confirm Liveness Check' : 'Awaiting Digit Sequence...'}</span>
              </button>
            </div>
          </div>
        ) : activeField ? (
          /* STANDARD ACTIVE FIELD CARD */
          <div className="bg-zinc-950 border-2 border-zinc-700 rounded-lg p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                {getFieldIcon(activeField.label)}
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Field: {activeField.label}
                </span>
              </div>
              <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700 font-semibold">
                AI Suggestion ({activeField.confidence}%)
              </span>
            </div>

            {/* AI Suggested Value */}
            <div>
              <span className="text-[11px] text-zinc-400 font-mono block mb-1">
                Recognized Text from Sign Gesture:
              </span>
              <div className="p-3 bg-zinc-900 border border-zinc-700/80 rounded font-mono text-sm font-bold text-white break-all shadow-inner">
                {activeField.aiValue}
              </div>
            </div>

            {/* Request Re-sign Status Banner if retry clicked */}
            {activeField.reSignActive && (
              <div className="bg-amber-950/40 border border-amber-800/80 rounded p-2 text-xs text-amber-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Waiting for customer to re-sign...</span>
              </div>
            )}

            {/* Retry Cap Suggestion Banner */}
            {(activeField.retryCount || 0) >= 2 && (
              <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded text-xs text-zinc-300 space-y-1">
                <p className="font-bold text-amber-400">
                  Multiple Re-sign Attempts ({activeField.retryCount} retries)
                </p>
                <p className="text-[11px] text-zinc-400">
                  Camera or lighting conditions unclear. Consider bridging a certified ISL interpreter.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              {/* Primary Confirm Button */}
              <button
                onClick={() => onConfirmField(activeField.id)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-md shadow-sm shadow-emerald-950 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Record Field</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  onClick={() => onEditField(activeField)}
                  className="text-zinc-400 hover:text-white font-semibold underline flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit manually</span>
                </button>

                <button
                  onClick={() => onRequestReSign(activeField)}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    Request Re-sign{" "}
                    {activeField.retryCount ? `(${activeField.retryCount})` : ""}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ALL FIELDS CONFIRMED STATE */
          <div className="bg-emerald-950/30 border border-emerald-800/80 rounded-lg p-4 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-bold text-xs text-emerald-300">
              All Required KYC Fields Confirmed by Official
            </p>
            <p className="text-[11px] text-emerald-400/80 font-mono">
              Ready for final submission to Concurrent Audit Queue.
            </p>
          </div>
        )}

        {/* 4. COMPLETED FIELDS TRAY */}
        <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
          <button
            onClick={() => setIsTrayOpen(!isTrayOpen)}
            className="w-full p-2.5 bg-zinc-900/90 hover:bg-zinc-800/80 border-b border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-200 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5 uppercase tracking-wider font-mono text-[11px] text-zinc-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Confirmed KYC Records Tray ({completedFields.length}/{fields.length})
            </span>
            {isTrayOpen ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {isTrayOpen && (
            <div className="p-2 space-y-1.5 max-h-44 overflow-y-auto custom-scrollbar">
              {completedFields.length === 0 ? (
                <p className="text-xs text-zinc-500 italic text-center py-2">
                  No confirmed fields yet. Click Confirm on the active card.
                </p>
              ) : (
                completedFields.map((f) => (
                  <div
                    key={f.id}
                    className="p-2 rounded bg-zinc-900/80 border border-zinc-800 text-xs flex items-center justify-between"
                  >
                    <div className="truncate pr-2">
                      <span className="font-bold text-zinc-200">{f.label}: </span>
                      <span className="font-mono text-zinc-400">
                        {f.confirmedValue || f.aiValue}
                      </span>
                    </div>
                    <span className="text-emerald-400 flex items-center gap-1 shrink-0 font-bold text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> OK
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 5. ESCALATE TO INTERPRETER BUTTON */}
        <div className="pt-1">
          <button
            onClick={onEscalateToInterpreter}
            className="w-full p-3 bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-lg flex items-center justify-between text-zinc-200 text-xs font-bold transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-sky-400" />
              <div className="text-left">
                <span className="block text-zinc-200">Connect certified interpreter</span>
                <span className="text-[10px] text-zinc-500 font-normal">
                  Standard RBI accessibility fallback option
                </span>
              </div>
            </div>
            <span className="text-xs text-sky-400 font-mono underline">
              Bridge Feed
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
