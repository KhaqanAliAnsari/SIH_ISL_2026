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
}) => {
  const [isTrayOpen, setIsTrayOpen] = useState(true);

  // Confidence Meter Bands (Monochrome)
  const getConfidenceLevel = (score: number) => {
    if (score >= 85) {
      return {
        bg: "bg-zinc-900",
        border: "border-zinc-700",
        text: "text-sky-400",
        bar: "bg-sky-500",
        label: "HIGH CONFIDENCE (>85%)",
        desc: "Ready for official confirmation",
      };
    } else if (score >= 60) {
      return {
        bg: "bg-zinc-900",
        border: "border-zinc-800",
        text: "text-zinc-300",
        bar: "bg-zinc-400",
        label: "MODERATE CONFIDENCE (60-85%)",
        desc: "Review or request gesture re-sign",
      };
    } else {
      return {
        bg: "bg-zinc-950",
        border: "border-zinc-800",
        text: "text-zinc-500",
        bar: "bg-zinc-600",
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
    <div className="col-span-12 lg:col-span-5 flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xs font-bold text-sky-400 uppercase tracking-wider font-sans">
            AI Sign Translation &amp; Active Field Card
          </h2>
          <p className="text-[11px] text-zinc-400 font-mono">
            Human-in-the-Loop Official Workstation
          </p>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-gray-700 border border-gray-300 font-semibold">
          NLU Protocol Active
        </span>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar">
<<<<<<< Updated upstream
        {/* 1. LIVE CAPTION BOX (Trust-critical exception: sits larger/heavier than standard text) */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
=======
        {/* 1. LIVE CAPTION BOX */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <div className="mb-1.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
>>>>>>> Stashed changes
              Live Customer ISL Translation
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              Latency: 110ms
            </span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded p-3 text-sm font-bold text-white leading-snug">
            "{liveCaptionText}"
          </div>
<<<<<<< Updated upstream

          <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 mt-1.5">
            <span>ISL Syntax: Subject-Object-Verb Structure</span>
            <span className="text-green-700 font-bold">Verified</span>
          </div>
=======
>>>>>>> Stashed changes
        </div>

        {/* 2. CONFIDENCE METER */}
        <div className={`border rounded-lg p-3 ${conf.bg} ${conf.border}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Recognition Confidence Score
            </span>
            <span
              className={`text-sm font-black font-mono px-2 py-0.5 rounded border bg-zinc-950 ${conf.text} ${conf.border}`}
            >
              {confidenceScore}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-zinc-800 h-2 rounded overflow-hidden mb-1.5 border border-zinc-700">
            <div
              className={`h-full ${conf.bar} transition-all duration-300`}
              style={{ width: `${confidenceScore}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs text-white font-medium">
            <span>{conf.label}</span>
            <span className="text-[11px] text-zinc-400">{conf.desc}</span>
          </div>
        </div>

        {/* 3. ACTIVE FIELD CARD */}
        {demoState === "liveness_code_step" ? (
          /* LIVENESS RESPONSE PANEL VARIANT */
          <div className="bg-zinc-950 border border-zinc-500 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-white" />
                Liveness Gesture Response Panel
              </span>
              <span className="text-[10px] font-mono bg-zinc-800 text-white px-2 py-0.5 rounded font-bold border border-zinc-700">
                Active Step 5/7
              </span>
            </div>

            <p className="text-xs text-zinc-400">
              Recognized sequence signed by customer in real-time:
            </p>

            <div className="p-3 bg-zinc-900 border border-zinc-700 rounded text-center">
              <span className="text-xs text-zinc-500 font-mono block mb-1">
                Customer Signed Response
              </span>
              <span className="font-mono font-bold text-xl text-white tracking-widest">
                Customer signed: {livenessCode.split("").join(" → ")}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => onConfirmField("5")}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2.5 px-4 rounded flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Liveness Check</span>
              </button>
            </div>
          </div>
        ) : activeField ? (
          /* STANDARD ACTIVE FIELD CARD */
          <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                {getFieldIcon(activeField.label)}
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Field: {activeField.label}
                </span>
              </div>
              <span className="text-[10px] font-mono bg-zinc-900 text-white px-2 py-0.5 rounded border border-zinc-700 font-semibold">
                AI Suggestion ({activeField.confidence}%)
              </span>
            </div>

            {/* AI Suggested Value */}
            <div>
              <span className="text-[11px] text-zinc-500 font-mono block mb-1">
                Recognized Text from Sign Gesture:
              </span>
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded font-mono text-sm font-bold text-white break-all">
                {activeField.aiValue}
              </div>
            </div>

            {/* Request Re-sign Status Banner if retry clicked */}
            {activeField.reSignActive && (
              <div className="bg-zinc-800 border border-zinc-700 rounded p-2 text-xs text-zinc-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-zinc-400 animate-spin" />
                <span>Waiting for customer to re-sign...</span>
              </div>
            )}

            {/* Retry Cap Suggestion Banner */}
            {(activeField.retryCount || 0) >= 2 && (
              <div className="bg-zinc-900 border border-zinc-700 p-2.5 rounded text-xs text-white space-y-1">
                <p className="font-bold">
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
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2.5 px-4 rounded shadow-none flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Record Field</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  onClick={() => onEditField(activeField)}
                  className="text-zinc-400 hover:text-white font-bold underline flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit manually</span>
                </button>

                <button
                  onClick={() => onRequestReSign(activeField)}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-zinc-300 text-xs font-semibold flex items-center gap-1 transition-colors"
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
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-white mx-auto" />
            <p className="font-bold text-xs text-white">
              All Required KYC Fields Confirmed by Official
            </p>
            <p className="text-[11px] text-zinc-400 font-mono">
              Ready for final submission to Concurrent Audit Queue.
            </p>
          </div>
        )}

        {/* 4. COMPLETED FIELDS TRAY */}
        <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950">
          <button
            onClick={() => setIsTrayOpen(!isTrayOpen)}
            className="w-full p-2.5 bg-zinc-900 hover:bg-zinc-800 border-b border-zinc-800 flex items-center justify-between text-xs font-bold text-white cursor-pointer"
          >
            <span className="flex items-center gap-1.5 uppercase tracking-wider font-mono text-[11px]">
              <Shield className="w-3.5 h-3.5 text-white" />
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
                    className="p-2 rounded bg-zinc-900 border border-zinc-800 text-xs flex items-center justify-between"
                  >
                    <div className="truncate pr-2">
                      <span className="font-bold text-white">{f.label}: </span>
                      <span className="font-mono text-zinc-300">
                        {f.confirmedValue || f.aiValue}
                      </span>
                    </div>
                    <span className="text-white flex items-center gap-1 shrink-0 font-bold text-[10px]">
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
            className="w-full p-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-zinc-400" />
              <div className="text-left">
                <span className="block">Connect certified interpreter</span>
                <span className="text-[10px] text-zinc-500 font-normal">
                  Standard RBI accessibility fallback option
                </span>
              </div>
            </div>
            <span className="text-xs text-zinc-400 font-mono underline">
              Bridge Feed
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
