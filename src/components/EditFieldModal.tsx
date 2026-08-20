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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-none flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-md w-full text-white shadow-none overflow-hidden">
        <div className="p-4 bg-zinc-900 text-white border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-zinc-300">
            <Edit3 className="w-4 h-4 text-gray-600" />
            <span>Manual Override — {field.label}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-xs text-gray-600">
            Original AI Suggestion:{" "}
            <span className="font-mono text-white font-bold">
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
              className="w-full bg-zinc-900 border border-zinc-800 rounded p-2.5 text-xs font-mono text-white focus:outline-none focus:border-zinc-500 font-semibold"
            />
          </div>

          <p className="text-[11px] text-zinc-500 italic">
            Note: Manual edits are logged with your official employee signature in the V-CIP audit trail.
          </p>
        </div>

        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-medium rounded hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(field.id, val);
              onClose();
            }}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save & Approve</span>
          </button>
        </div>
      </div>
    </div>
  );
};
