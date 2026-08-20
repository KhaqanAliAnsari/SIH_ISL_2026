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
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-md w-full text-white shadow-none overflow-hidden">
        <div className="p-4 bg-zinc-900 text-white border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-zinc-300">
            <UserCheck className="w-4 h-4 text-green-600" />
            <span>Connect Certified ISL Interpreter</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">
            Per RBI V-CIP accessibility rules, a Level-3 certified ISL interpreter can be bridged into the live video call at any time.
          </p>

          <div className="bg-zinc-900 p-3.5 rounded border border-zinc-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-zinc-800 border border-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-lg">
              <UserCheck className="w-6 h-6 text-zinc-300" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                Ananya M.
              </h4>
              <p className="text-[11px] text-zinc-300 font-medium">
                Level-3 Certified ISL Interpreter (#INT-104)
              </p>
              <p className="text-[10px] text-green-700 font-mono mt-0.5 font-bold">
                ● Available (BKC Hub)
              </p>
            </div>
          </div>
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
