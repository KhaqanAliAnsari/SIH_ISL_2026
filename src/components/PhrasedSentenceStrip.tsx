import React, { useEffect, useRef, useState } from "react";
import { CheckCircle2, MessageSquare, Loader2, AlertCircle, Clock, History, X } from "lucide-react";
import type { PhrasedSentence } from "../types";

interface PhrasedSentenceStripProps {
  sentences: PhrasedSentence[];       // Active on-screen queue (up to 5 items)
  fullHistory?: PhrasedSentence[];     // Full conversation transcript (all sentences)
  isAccumulating: boolean;
}

export const PhrasedSentenceStrip: React.FC<PhrasedSentenceStripProps> = ({
  sentences,
  fullHistory = [],
  isAccumulating,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLogModal, setShowLogModal] = useState(false);

  // Auto-scroll to the newest item on the right
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  }, [sentences, isAccumulating]);

  if (sentences.length === 0 && !isAccumulating && fullHistory.length === 0) {
    return null;
  }

  const allLogs = fullHistory.length > 0 ? fullHistory : sentences;

  return (
    <>
      <div className="w-full bg-zinc-950 border border-zinc-800 rounded-lg shadow-sm p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-sky-400">AI Phrased Sentences</span>
            <span className="text-[10px] font-mono font-normal bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800">
              Queue ({sentences.length}/5)
            </span>
          </div>

          {allLogs.length > 0 && (
            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white hover:underline transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Full Log ({allLogs.length})</span>
            </button>
          )}
        </div>
        
        <div 
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto pb-1.5 custom-scrollbar"
        >
          {sentences.map((sentence) => {
            const isTimeout = sentence.corrections?.some(c => c.toLowerCase().includes("timeout") || c.toLowerCase().includes("separate"));
            return (
              <div 
                key={sentence.id}
                className={`flex-shrink-0 min-w-[280px] max-w-sm rounded-lg border p-3 flex flex-col gap-2 transition-all duration-300 transform hover:scale-[1.01] ${
                  sentence.status === "pending" 
                    ? "bg-zinc-900 border-zinc-700 animate-pulse" 
                    : sentence.status === "error"
                      ? "bg-zinc-900 border-zinc-600"
                      : "bg-zinc-900 border-zinc-700 shadow-sm"
                }`}
              >
                {/* Header: Status & Timestamp */}
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={`px-1.5 py-0.5 rounded font-bold flex items-center gap-1 ${
                    sentence.status === "pending" ? "text-zinc-300 bg-zinc-800 border border-zinc-700" :
                    sentence.status === "error" ? "text-white bg-zinc-800 border border-zinc-600" :
                    isTimeout ? "text-zinc-400 bg-zinc-800 border border-zinc-700" :
                    "text-sky-400 bg-sky-500/10 border border-sky-500/30"
                  }`}>
                    {sentence.status === "pending" && <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />}
                    {sentence.status === "error" && <AlertCircle className="w-3 h-3 text-white" />}
                    {sentence.status === "done" && (
                      isTimeout ? <Clock className="w-3 h-3 text-zinc-400" /> : <CheckCircle2 className="w-3 h-3 text-sky-400" />
                    )}
                    
                    {sentence.status === "pending" ? "Processing..." :
                     sentence.status === "error" ? "Raw Output" :
                     isTimeout ? "Auto 18s (Unmerged)" : "AI Phrased (Merged)"}
                  </span>
                  <span className="text-zinc-500">
                    {new Date(sentence.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {/* Phrased Text */}
                <div className={`font-bold text-sm leading-snug ${
                  sentence.status === "pending" ? "text-zinc-300" :
                  sentence.status === "error" ? "text-zinc-400" :
                  "text-white"
                }`}>
                  {sentence.phrasedText || "Waiting for AI..."}
                </div>

                {/* Raw Tokens */}
                <div className="text-[10px] font-mono text-zinc-500 truncate border-t border-zinc-800 pt-1.5 mt-auto">
                  Signed: {sentence.rawTokens.map(t => t.word).join(" → ")}
                </div>
              </div>
            );
          })}

          {isAccumulating && (
            <div className="flex-shrink-0 min-w-[200px] h-full flex flex-col items-center justify-center p-3 border-2 border-dashed border-zinc-700 rounded-lg bg-zinc-900/50 text-zinc-400">
              <Loader2 className="w-5 h-5 animate-spin mb-1 opacity-50 text-white" />
              <span className="text-xs font-medium text-zinc-300">Signing in progress...</span>
              <span className="text-[10px] font-mono text-zinc-500">18s idle auto-dispatch</span>
            </div>
          )}
        </div>
      </div>

      {/* Full Conversation History Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-2xl w-full text-white shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-tight text-white">
                  Full Session ISL Conversation Log ({allLogs.length} Sentences)
                </h3>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
              {allLogs.map((item, idx) => (
                <div key={item.id || idx} className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <span className="font-bold text-zinc-300">Sentence #{idx + 1}</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    "{item.phrasedText}"
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 flex flex-wrap gap-1">
                    <span className="font-semibold text-zinc-500">Tokens:</span>
                    {item.rawTokens.map((t, ti) => (
                      <span key={ti} className="bg-zinc-800 px-1.5 py-0.2 rounded border border-zinc-700">
                        {t.word} ({t.confidence}%)
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowLogModal(false)}
                className="px-4 py-1.5 bg-white text-black font-medium text-xs rounded hover:bg-zinc-200 transition-colors"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
