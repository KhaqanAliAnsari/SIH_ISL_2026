import React from "react";
import { Save, LogOut, FileText, Tag, ShieldCheck } from "lucide-react";

interface FooterControlsProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onSaveLater: () => void;
  onEndSession: () => void;
  onSubmitAudit: () => void;
  isAllConfirmed: boolean;
}

export const FooterControls: React.FC<FooterControlsProps> = ({
  notes,
  onNotesChange,
  onSaveLater,
  onEndSession,
  onSubmitAudit,
  isAllConfirmed,
}) => {
  const quickTags = [
    "Aadhaar OCR Verified",
    "Customer signed name clearly",
    "Liveness digits confirmed",
  ];

  const addTag = (tag: string) => {
    if (!notes.includes(tag)) {
      onNotesChange(notes ? `${notes} • ${tag}` : tag);
    }
  };

  return (
    <footer className="h-16 bg-zinc-950 border-t border-zinc-800 px-5 flex items-center justify-between shrink-0 z-20 select-none">
      {/* Official Remarks Field */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl mr-4">
        <div className="flex items-center gap-1.5 text-white text-xs font-bold shrink-0">
          <FileText className="w-4 h-4 text-zinc-400" />
          <span className="hidden sm:inline">Official Remarks:</span>
        </div>

        <input
          type="text"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Type official session remarks, sign clarity observations, or document notes..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-sans transition-colors"
        />

        <div className="hidden xl:flex items-center gap-1 shrink-0">
          {quickTags.slice(0, 2).map((tag, i) => (
            <button
              key={i}
              onClick={() => addTag(tag)}
              className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-300 border border-zinc-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Tag className="w-2.5 h-2.5 text-zinc-500" />
              <span>{tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onSaveLater}
          className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Save &amp; Continue Later</span>
        </button>

        {/* commit_approved_kyc_button */}
        <button
          onClick={onSubmitAudit}
          disabled={!isAllConfirmed}
          className={`px-4 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 transition-colors ${
            isAllConfirmed
              ? "bg-white hover:bg-zinc-200 text-black cursor-pointer"
              : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
          }`}
          title={
            isAllConfirmed
              ? "Submit for RBI Concurrent Audit"
              : "Confirm all KYC fields first to enable audit submission"
          }
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Submit for Concurrent Audit</span>
        </button>

        <button
          onClick={onEndSession}
          className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-zinc-500" />
          <span className="hidden sm:inline">End Session</span>
        </button>
      </div>
    </footer>
  );
};
