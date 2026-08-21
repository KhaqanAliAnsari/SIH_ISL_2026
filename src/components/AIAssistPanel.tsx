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

  // Confidence Meter Bands
  const getConfidenceLevel = (score: number) => {
    if (score >= 85) {
      return {
        bg: "bg-green-50",
        border: "border-green-300",
        text: "text-green-800",
        bar: "bg-green-600",
        label: "HIGH CONFIDENCE (>85%)",
        desc: "Ready for official confirmation",
      };
    } else if (score >= 60) {
      return {
        bg: "bg-amber-50",
        border: "border-amber-300",
        text: "text-amber-800",
        bar: "bg-amber-600",
        label: "MODERATE CONFIDENCE (60-85%)",
        desc: "Review or request gesture re-sign",
      };
    } else {
      return {
        bg: "bg-red-50",
        border: "border-red-300",
        text: "text-red-800",
        bar: "bg-red-600",
        label: "LOW CONFIDENCE (<60%)",
        desc: "Escalate to Certified ISL Interpreter",
      };
    }
  };

  const conf = getConfidenceLevel(confidenceScore);

  const getFieldIcon = (label: string) => {
    if (label.toLowerCase().includes("name"))
      return <User className="w-4 h-4 text-gray-500" />;
    if (label.toLowerCase().includes("aadhaar") || label.toLowerCase().includes("id"))
      return <Fingerprint className="w-4 h-4 text-gray-500" />;
    if (label.toLowerCase().includes("address"))
      return <MapPin className="w-4 h-4 text-gray-500" />;
    if (label.toLowerCase().includes("dob") || label.toLowerCase().includes("date"))
      return <Calendar className="w-4 h-4 text-gray-500" />;
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  const completedFields = fields.filter((f) => f.isConfirmed);

  return (
    <div className="col-span-12 lg:col-span-5 flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-sans">
            AI Sign Translation &amp; Active Field Card
          </h2>
          <p className="text-[11px] text-gray-500 font-mono">
            Human-in-the-Loop Official Workstation
          </p>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar">
        {/* 1. LIVE CAPTION BOX (Trust-critical exception: sits larger/heavier than standard text) */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="mb-1.5">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Live Customer ISL Translation
            </span>
          </div>

          <div className="bg-white border border-gray-300 rounded p-3 text-sm font-bold text-gray-900 leading-snug">
            "{liveCaptionText}"
          </div>

        </div>

        {/* 2. CONFIDENCE METER (Trust-critical exception: persistent high visibility element) */}
        <div className={`border rounded-lg p-3 ${conf.bg} ${conf.border}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Recognition Confidence Score
            </span>
            <span
              className={`text-sm font-black font-mono px-2 py-0.5 rounded border bg-white ${conf.text} ${conf.border}`}
            >
              {confidenceScore}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-2 rounded overflow-hidden mb-1.5 border border-gray-300">
            <div
              className={`h-full ${conf.bar} transition-all duration-300`}
              style={{ width: `${confidenceScore}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-800 font-medium">
            <span>{conf.label}</span>
            <span className="text-[11px] text-gray-600">{conf.desc}</span>
          </div>
        </div>

        {/* 3. ACTIVE FIELD CARD (Active-Step Focused Card — not scrolling list) */}
        {demoState === "liveness_code_step" ? (
          /* LIVENESS RESPONSE PANEL VARIANT */
          <div className="bg-white border-2 border-amber-500 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-600" />
                Liveness Gesture Response Panel
              </span>
              <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                Active Step 5/7
              </span>
            </div>

            <p className="text-xs text-gray-600">
              Recognized sequence signed by customer in real-time:
            </p>

            <div className="p-3 bg-gray-50 border border-gray-300 rounded text-center">
              <span className="text-xs text-gray-500 font-mono block mb-1">
                Customer Signed Response
              </span>
              <span className="font-mono font-bold text-xl text-gray-900 tracking-widest">
                Customer signed: {livenessCode.split("").join(" → ")}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => onConfirmField("5")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2.5 px-4 rounded flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Liveness Check</span>
              </button>
            </div>
          </div>
        ) : activeField ? (
          /* STANDARD ACTIVE FIELD CARD */
          <div className="bg-white border-2 border-gray-400 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2">
                {getFieldIcon(activeField.label)}
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Active Field: {activeField.label}
                </span>
              </div>
              <span className="text-[10px] font-mono bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-300 font-semibold">
                AI Suggestion ({activeField.confidence}%)
              </span>
            </div>

            {/* AI Suggested Value */}
            <div>
              <span className="text-[11px] text-gray-500 font-mono block mb-1">
                Recognized Text from Sign Gesture:
              </span>
              <div className="p-3 bg-gray-50 border border-gray-300 rounded font-mono text-sm font-bold text-gray-900 break-all">
                {activeField.aiValue}
              </div>
            </div>

            {/* Request Re-sign Status Banner if retry clicked */}
            {activeField.reSignActive && (
              <div className="bg-amber-50 border border-amber-300 rounded p-2 text-xs text-amber-900 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
                <span>Waiting for customer to re-sign...</span>
              </div>
            )}

            {/* Retry Cap Suggestion Banner */}
            {(activeField.retryCount || 0) >= 2 && (
              <div className="bg-gray-100 border border-gray-300 p-2.5 rounded text-xs text-gray-800 space-y-1">
                <p className="font-bold text-gray-900">
                  Multiple Re-sign Attempts ({activeField.retryCount} retries)
                </p>
                <p className="text-[11px] text-gray-600">
                  Camera or lighting conditions unclear. Consider bridging a certified ISL interpreter.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              {/* Primary Confirm Button */}
              <button
                onClick={() => onConfirmField(activeField.id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2.5 px-4 rounded shadow-none flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Record Field</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  onClick={() => onEditField(activeField)}
                  className="text-gray-700 hover:text-black font-bold underline flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit manually</span>
                </button>

                <button
                  onClick={() => onRequestReSign(activeField)}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-gray-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
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
          <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
            <p className="font-bold text-xs text-green-900">
              All Required KYC Fields Confirmed by Official
            </p>
            <p className="text-[11px] text-green-800 font-mono">
              Ready for final submission to Concurrent Audit Queue.
            </p>
          </div>
        )}

        {/* 4. COMPLETED FIELDS TRAY (Compact read-only rows: field name + confirmed value + green check) */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <button
            onClick={() => setIsTrayOpen(!isTrayOpen)}
            className="w-full p-2.5 bg-gray-50 hover:bg-gray-100 border-b border-gray-200 flex items-center justify-between text-xs font-bold text-gray-800"
          >
            <span className="flex items-center gap-1.5 uppercase tracking-wider font-mono text-[11px]">
              <Shield className="w-3.5 h-3.5 text-green-600" />
              Confirmed KYC Records Tray ({completedFields.length}/{fields.length})
            </span>
            {isTrayOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {isTrayOpen && (
            <div className="p-2 space-y-1.5 max-h-44 overflow-y-auto custom-scrollbar">
              {completedFields.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-2">
                  No confirmed fields yet. Click Confirm on the active card.
                </p>
              ) : (
                completedFields.map((f) => (
                  <div
                    key={f.id}
                    className="p-2 rounded bg-gray-50 border border-gray-200 text-xs flex items-center justify-between"
                  >
                    <div className="truncate pr-2">
                      <span className="font-bold text-gray-900">{f.label}: </span>
                      <span className="font-mono text-gray-700">
                        {f.confirmedValue || f.aiValue}
                      </span>
                    </div>
                    <span className="text-green-600 flex items-center gap-1 shrink-0 font-bold text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> OK
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 5. ESCALATE TO INTERPRETER BUTTON (Neutral outline style: surface_card fill, border_hairline border, text_primary label) */}
        <div className="pt-1">
          <button
            onClick={onEscalateToInterpreter}
            className="w-full p-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg flex items-center justify-between text-gray-900 text-xs font-bold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-gray-700" />
              <div className="text-left">
                <span className="block">Connect certified interpreter</span>
                <span className="text-[10px] text-gray-500 font-normal">
                  Standard RBI accessibility fallback option
                </span>
              </div>
            </div>
            <span className="text-xs text-gray-600 font-mono underline">
              Bridge Feed
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
