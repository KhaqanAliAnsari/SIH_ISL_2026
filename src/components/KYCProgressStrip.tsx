import React from "react";
import { CheckCircle2, Loader2, AlertTriangle, FileCheck } from "lucide-react";
import { ProgressStep } from "../types";

interface KYCProgressStripProps {
  steps: ProgressStep[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

export const KYCProgressStrip: React.FC<KYCProgressStripProps> = ({
  steps,
  currentStepIndex,
  onSelectStep,
}) => {
  const confirmedCount = steps.filter((s) => s.status === "confirmed").length;
  const progressPercent = Math.round((confirmedCount / steps.length) * 100);

  return (
    <div className="w-full bg-white border-t border-gray-200 p-2.5 select-none shrink-0 z-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-green-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-900 font-sans">
              RBI V-CIP Progress Stepper
            </span>
            <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono border border-gray-300 font-semibold">
              Structured KYC Audit
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-gray-700">
            <div>
              <span className="text-green-700 font-bold">
                {confirmedCount}
              </span>{" "}
              / {steps.length} Steps Confirmed ({progressPercent}%)
            </div>
            <div className="w-24 bg-gray-200 h-2 rounded overflow-hidden border border-gray-300">
              <div
                className="bg-green-600 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 7 Checkpoint Buttons */}
        <div className="flex items-stretch gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {steps.map((step, idx) => {
            const isSelected = idx === currentStepIndex;

            if (isSelected) {
              // Current Step (Full Treatment)
              let badge = <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />;
              let cardStyle = "bg-blue-50 border-blue-600 text-blue-900";
              
              if (step.status === "confirmed") {
                badge = <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />;
                cardStyle = "bg-green-50 border-green-600 text-gray-900";
              } else if (step.status === "needs_review") {
                badge = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
                cardStyle = "bg-amber-50 border-amber-600 text-amber-900";
              } else if (step.status === "pending") {
                badge = <span className="w-2 h-2 rounded-full bg-blue-500"></span>;
                cardStyle = "bg-gray-100 border-gray-400 text-gray-900";
              }

              return (
                <button
                  key={step.id}
                  onClick={() => onSelectStep(idx)}
                  className={`min-w-[160px] p-2 rounded-lg border-2 text-left transition-colors flex flex-col justify-between cursor-pointer shadow-sm shrink-0 ${cardStyle}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase opacity-70">
                      Step {idx + 1}
                    </span>
                    {badge}
                  </div>
                  <div className="text-xs font-bold truncate">{step.label}</div>
                  <div className="text-[10px] opacity-75 truncate mt-0.5">
                    {step.description}
                  </div>
                </button>
              );
            }

            // Minimal Treatment (Completed or Future)
            const isCompleted = step.status === "confirmed";
            
            return (
              <button
                key={step.id}
                onClick={() => onSelectStep(idx)}
                className={`min-w-[120px] px-3 py-2 rounded-lg border text-left transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
                  isCompleted
                    ? "bg-white border-green-300 hover:bg-green-50"
                    : "bg-white border-gray-200 hover:bg-gray-50 opacity-70"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0 ml-1"></span>
                )}
                <div className={`text-xs truncate ${isCompleted ? "font-semibold text-gray-800" : "font-medium text-gray-500"}`}>
                  {step.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
