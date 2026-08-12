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
    <footer className="h-16 bg-white border-t border-gray-200 px-5 flex items-center justify-between shrink-0 z-20 select-none">
      {/* Official Remarks Field */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl mr-4">
        <div className="flex items-center gap-1.5 text-gray-700 text-xs font-bold shrink-0">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="hidden sm:inline">Official Remarks:</span>
        </div>

        <input
          type="text"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Type official session remarks, sign clarity observations, or document notes..."
          className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 font-sans"
        />

        <div className="hidden xl:flex items-center gap-1 shrink-0">
          {quickTags.slice(0, 2).map((tag, i) => (
            <button
              key={i}
              onClick={() => addTag(tag)}
              className="px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-[10px] text-gray-700 border border-gray-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Tag className="w-2.5 h-2.5 text-gray-500" />
              <span>{tag}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onSaveLater}
          className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5 text-gray-600" />
          <span className="hidden sm:inline">Save &amp; Continue Later</span>
        </button>

        {/* commit_approved_kyc_button */}
        <button
          onClick={onSubmitAudit}
          disabled={!isAllConfirmed}
          className={`px-4 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 transition-colors ${
            isAllConfirmed
              ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
              : "bg-gray-300 text-gray-500 border border-gray-300 cursor-not-allowed"
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
          className="px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 border border-red-300 text-red-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-red-600" />
          <span className="hidden sm:inline">End Session</span>
        </button>
      </div>
    </footer>
  );
};
