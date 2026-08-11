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
      <div className="bg-white border border-gray-300 rounded-lg max-w-md w-full text-gray-900 shadow-none overflow-hidden">
        <div className="p-4 bg-gray-100 text-gray-900 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-gray-800">
            <Edit3 className="w-4 h-4 text-gray-600" />
            <span>Manual Override — {field.label}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-xs text-gray-600">
            Original AI Suggestion:{" "}
            <span className="font-mono text-gray-900 font-bold">
              {field.aiValue}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Official Approved Record Value:
            </label>
            <input
              type="text"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded p-2.5 text-xs font-mono text-gray-900 focus:outline-none focus:border-gray-500 font-semibold"
            />
          </div>

          <p className="text-[11px] text-gray-500 italic">
            Note: Manual edits are logged with your official employee signature in the V-CIP audit trail.
          </p>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-100"
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
