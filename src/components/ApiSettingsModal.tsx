import React, { useState, useEffect } from "react";
import { Key, Save, X, AlertCircle, CheckCircle2 } from "lucide-react";

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem("SIH_GEMINI_API_KEY");
      if (stored) setApiKey(stored);
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem("SIH_GEMINI_API_KEY", apiKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-zinc-800/50 p-4 border-b border-zinc-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-100">
            <Key className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold">API Configuration (Judges)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-sm text-zinc-300">
          <div className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-3 flex gap-3 text-amber-200/90">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
            <p className="text-xs leading-relaxed">
              <strong>Offline APK Mode:</strong> The Vercel backend proxy is unavailable in this standalone build. Please provide a valid Gemini API key to run the NLP engine locally.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
            />
            <p className="text-[10px] text-zinc-500 text-right">
              Keys are stored in secure local storage on this device only.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKey.trim() || saved}
            className={`px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              saved
                ? "bg-emerald-600 text-white"
                : apiKey.trim()
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-900/20"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }`}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Key</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
