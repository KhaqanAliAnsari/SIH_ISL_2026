import React from "react";
import { CheckCircle2, Loader2, AlertTriangle, FileCheck } from "lucide-react";
import { ProgressStep } from "../types";
import { Capacitor } from '@capacitor/core';

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
  const isNative = Capacitor.isNativePlatform();

  const confirmedCount = steps.filter((s) => s.status === "confirmed").length;
  const progressPercent = Math.round((confirmedCount / steps.length) * 100);

  return (
    <div className="w-full bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 p-2.5 select-none shrink-0 z-10 text-zinc-100">
      <div className="max-w-7xl mx-auto">


        {/* 7 Checkpoint Buttons */}
        <div className="flex items-stretch gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {steps.map((step, idx) => {
            const isSelected = idx === currentStepIndex;

            if (isSelected) {
              // Current Step (Full Treatment)
              let badge = <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />;
              let cardStyle = "bg-sky-950/40 border-sky-500 text-sky-200 ring-1 ring-sky-500/30";
              
              if (step.status === "confirmed") {
                badge = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
                cardStyle = "bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/30";
              } else if (step.status === "needs_review") {
                badge = <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
                cardStyle = "bg-amber-950/40 border-amber-500 text-amber-200 ring-1 ring-amber-500/30";
              } else if (step.status === "pending") {
                badge = <span className="w-2 h-2 rounded-full bg-sky-400"></span>;
                cardStyle = "bg-zinc-800 border-zinc-600 text-zinc-100";
              }

              return (
                <button
                  key={step.id}
                  onClick={() => onSelectStep(idx)}
                  className={`min-w-[160px] p-2 rounded-lg border-2 text-left transition-all flex flex-col justify-between cursor-pointer shadow-md shrink-0 ${cardStyle}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase opacity-80">
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
                className={`min-w-[120px] px-3 py-2 rounded-lg border text-left transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  isCompleted
                    ? "bg-zinc-950 border-emerald-800/60 hover:bg-emerald-950/30 text-zinc-200 hover:border-emerald-700"
                    : "bg-zinc-950/70 border-zinc-800/80 hover:bg-zinc-800/60 text-zinc-400 hover:border-zinc-700 opacity-80"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0 ml-1"></span>
                )}
                <div className={`text-xs truncate ${isCompleted ? "font-semibold text-zinc-200" : "font-medium text-zinc-400"}`}>
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
