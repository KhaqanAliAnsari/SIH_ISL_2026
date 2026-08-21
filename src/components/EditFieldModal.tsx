import React, { useState, useEffect } from "react";
import { Edit3, CheckCircle2, X } from "lucide-react";
import { KYCField } from "../types";

interface EditFieldModalProps {
  field: KYCField | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (fieldId: string, newValue: string) => void;
}

export const EditFieldModal: React.FC<EditFieldModalProps> = ({
  field,
  isOpen,
  onClose,
  onSave,
}) => {
  const [val, setVal] = useState("");

  useEffect(() => {
    if (field) {
      setVal(field.confirmedValue || field.aiValue);
    }
  }, [field]);

  if (!isOpen || !field) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full text-white shadow-2xl overflow-hidden">
        <div className="p-4 bg-zinc-950/80 text-white border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-white">
            <Edit3 className="w-4 h-4 text-sky-400" />
            <span>Manual Override — {field.label}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-xs text-zinc-400">
            Original AI Suggestion:{" "}
            <span className="font-mono text-white font-bold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
              {field.aiValue}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Official Approved Record Value:
            </label>
            <input
              type="text"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-semibold"
            />
          </div>

          <p className="text-[11px] text-zinc-500 italic">
            Note: Manual edits are logged with your official employee signature in the V-CIP audit trail.
          </p>
        </div>

        <div className="p-4 bg-zinc-950/80 border-t border-zinc-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-medium rounded-md transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(field.id, val);
              onClose();
            }}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-md flex items-center gap-1.5 shadow-sm shadow-emerald-950 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save &amp; Approve</span>
          </button>
        </div>
      </div>
    </div>
  );
};
