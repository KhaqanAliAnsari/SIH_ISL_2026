import React from "react";
import { UserCheck, Video, X } from "lucide-react";

interface InterpreterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export const InterpreterModal: React.FC<InterpreterModalProps> = ({
  isOpen,
  onClose,
  onConnect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-none flex items-center justify-center p-4">
      <div className="bg-white border border-gray-300 rounded-lg max-w-md w-full text-gray-900 shadow-none overflow-hidden">
        <div className="p-4 bg-gray-100 text-gray-900 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-gray-800">
            <UserCheck className="w-4 h-4 text-green-600" />
            <span>Connect Certified ISL Interpreter</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-700 leading-relaxed">
            Per RBI V-CIP accessibility rules, a Level-3 certified ISL interpreter can be bridged into the live video call at any time.
          </p>

          <div className="bg-gray-50 p-3.5 rounded border border-gray-200 flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-gray-200 border border-gray-300 text-gray-800 flex items-center justify-center font-bold text-lg">
              <UserCheck className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900">
                Ananya M.
              </h4>
              <p className="text-[11px] text-gray-700 font-medium">
                Level-3 Certified ISL Interpreter (#INT-104)
              </p>
              <p className="text-[10px] text-green-700 font-mono mt-0.5 font-bold">
                ● Available (BKC Hub)
              </p>
            </div>
          </div>
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
              onConnect();
              onClose();
            }}
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded flex items-center gap-1.5"
          >
            <Video className="w-4 h-4" />
            <span>Bridge Interpreter Feed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
