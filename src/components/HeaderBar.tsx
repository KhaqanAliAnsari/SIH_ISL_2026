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
    <header className="h-16 bg-zinc-950 border-b border-zinc-800 px-5 flex items-center justify-between select-none shrink-0 z-20">
      {/* Left: Bank Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded border border-zinc-800 bg-zinc-900 text-white font-bold">
          <Shield className="w-5 h-5 text-zinc-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sky-400 text-sm tracking-tight">
              INDUS APEX BANK
            </span>
            <span className="text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-semibold">
              V-CIP ASSIST VIEW
            </span>
          </div>
          <p className="text-xs text-zinc-400 flex items-center gap-2 font-mono mt-0.5">
            <span>Session ID: {sessionId}</span>
            <span className="text-zinc-700">•</span>
            <span>{timestamp}</span>
          </p>
        </div>
      </div>

      {/* Center: Session Status & Quick Demo View */}
      <div className="flex items-center gap-4">
        {/* Status Pill (Monochromatic) */}
        <div>
          {status === "LIVE" && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 text-white border border-zinc-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <Video className="w-3.5 h-3.5" />
              <span>LIVE</span>
            </div>
          )}

          {status === "ESCALATED" && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 text-zinc-100 border border-zinc-600 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-zinc-300" />
              <span>ESCALATED</span>
            </div>
          )}

          {status === "COMPLETED" && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
              <span>COMPLETED</span>
            </div>
          )}
        </div>

        {/* Demo Preset Switcher for testing (De-emphasized) */}
        <div className="hidden xl:flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
          <select
            value={demoState}
            onChange={(e) => onSelectDemoState(e.target.value as DemoState)}
            className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 rounded px-1 py-0.5 outline-none font-mono cursor-pointer"
            title="Demo State (Dev Mode)"
          >
            <option value="normal_recognition">Demo: Normal Field</option>
            <option value="liveness_code_step">Demo: Liveness Step</option>
            <option value="low_confidence_or_escalated">Demo: Escalated</option>
            <option value="session_complete">Demo: Session Complete</option>
          </select>
        </div>
      </div>

      {/* Right: Official Name Tag & Customer View Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCustomerView}
          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-xs text-zinc-300 font-medium flex items-center gap-1.5 transition-colors"
          title="Inspect the Customer's Call Screen"
        >
          <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Customer Screen Preview</span>
        </button>

        <div className="text-right hidden sm:block border-l border-zinc-800 pl-3">
          <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
            <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>{officialName}</span>
            <span className="text-zinc-500 font-mono text-[11px]">
              ({empId})
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 flex items-center justify-end gap-1 font-mono mt-0.5">
            <Building2 className="w-3 h-3 text-zinc-500" />
            <span>{branch}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
