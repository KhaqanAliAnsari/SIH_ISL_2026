import React from "react";
import {
  Building2,
  Video,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Smartphone,
  Shield,
} from "lucide-react";
import { SessionStatus, DemoState } from "../types";

interface HeaderBarProps {
  status: SessionStatus;
  demoState: DemoState;
  onSelectDemoState: (state: DemoState) => void;
  sessionId: string;
  timestamp: string;
  officialName: string;
  empId: string;
  branch: string;
  onOpenCustomerView: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  status,
  demoState,
  onSelectDemoState,
  sessionId,
  timestamp,
  officialName,
  empId,
  branch,
  onOpenCustomerView,
}) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-5 flex items-center justify-between select-none shrink-0 z-20">
      {/* Left: Bank Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded border border-gray-300 bg-gray-50 text-gray-800 font-bold">
          <Shield className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-sm tracking-tight">
              INDUS APEX BANK
            </span>
            <span className="text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-300 font-semibold">
              V-CIP ASSIST VIEW
            </span>
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-2 font-mono mt-0.5">
            <span>Session ID: {sessionId}</span>
            <span className="text-gray-300">•</span>
            <span>{timestamp}</span>
          </p>
        </div>
      </div>

      {/* Center: Session Status & Quick Demo View */}
      <div className="flex items-center gap-4">
        {/* Status Pill (green=LIVE, amber=ESCALATED, blue=COMPLETED) */}
        <div>
          {status === "LIVE" && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-100 text-green-800 border border-green-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-600"></span>
              <Video className="w-3.5 h-3.5" />
              <span>LIVE</span>
            </div>
          )}

          {status === "ESCALATED" && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>ESCALATED</span>
            </div>
          )}

          {status === "COMPLETED" && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-100 text-blue-800 border border-blue-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
              <span>COMPLETED</span>
            </div>
          )}
        </div>

        {/* Demo Preset Switcher for testing */}
        <div className="hidden xl:flex items-center bg-gray-100 p-1 rounded border border-gray-200 text-xs gap-1">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono px-1.5 font-bold">
            Demo State:
          </span>
          <button
            onClick={() => onSelectDemoState("normal_recognition")}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              demoState === "normal_recognition"
                ? "bg-white text-gray-900 font-bold border border-gray-300"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            1. Normal Field
          </button>
          <button
            onClick={() => onSelectDemoState("liveness_code_step")}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              demoState === "liveness_code_step"
                ? "bg-white text-gray-900 font-bold border border-gray-300"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            2. Liveness Step
          </button>
          <button
            onClick={() => onSelectDemoState("low_confidence_or_escalated")}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              demoState === "low_confidence_or_escalated"
                ? "bg-white text-gray-900 font-bold border border-gray-300"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            3. Escalated
          </button>
          <button
            onClick={() => onSelectDemoState("session_complete")}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              demoState === "session_complete"
                ? "bg-white text-gray-900 font-bold border border-gray-300"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            4. Session Complete
          </button>
        </div>
      </div>

      {/* Right: Official Name Tag & Customer View Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCustomerView}
          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs text-gray-700 font-medium flex items-center gap-1.5 transition-colors"
          title="Inspect the Customer's Call Screen"
        >
          <Smartphone className="w-3.5 h-3.5 text-gray-600" />
          <span className="hidden sm:inline">Customer Screen Preview</span>
        </button>

        <div className="text-right hidden sm:block border-l border-gray-200 pl-3">
          <div className="text-xs font-bold text-gray-900 flex items-center justify-end gap-1">
            <UserCheck className="w-3.5 h-3.5 text-gray-500" />
            <span>{officialName}</span>
            <span className="text-gray-500 font-mono text-[11px]">
              ({empId})
            </span>
          </div>
          <div className="text-[11px] text-gray-500 flex items-center justify-end gap-1 font-mono">
            <Building2 className="w-3 h-3 text-gray-400" />
            <span>{branch}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
