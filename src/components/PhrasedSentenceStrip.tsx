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
      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">
          <div className="flex items-center gap-1.5 text-gray-700">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Phrased Sentences</span>
            <span className="text-[10px] font-mono font-normal bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              Queue ({sentences.length}/5)
            </span>
          </div>

          {allLogs.length > 0 && (
            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-1 text-[11px] font-mono text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Full Log ({allLogs.length})</span>
            </button>
          )}
        </div>
        
        <div 
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        >
          {sentences.map((sentence) => {
            const isTimeout = sentence.corrections?.some(c => c.toLowerCase().includes("timeout") || c.toLowerCase().includes("separate"));
            return (
              <div 
                key={sentence.id}
                className={`flex-shrink-0 min-w-[280px] max-w-sm rounded-lg border p-3 flex flex-col gap-2 transition-all duration-300 transform hover:scale-[1.01] ${
                  sentence.status === "pending" 
                    ? "bg-indigo-50 border-indigo-200 animate-pulse" 
                    : sentence.status === "error"
                      ? "bg-red-50 border-red-200"
                      : "bg-green-50/80 border-green-300 shadow-sm"
                }`}
              >
                {/* Header: Status & Timestamp */}
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={`px-1.5 py-0.5 rounded font-bold flex items-center gap-1 ${
                    sentence.status === "pending" ? "text-indigo-700 bg-indigo-100" :
                    sentence.status === "error" ? "text-red-700 bg-red-100" :
                    isTimeout ? "text-amber-800 bg-amber-100 border border-amber-200" :
                    "text-green-800 bg-green-200"
                  }`}>
                    {sentence.status === "pending" && <Loader2 className="w-3 h-3 animate-spin" />}
                    {sentence.status === "error" && <AlertCircle className="w-3 h-3" />}
                    {sentence.status === "done" && (
                      isTimeout ? <Clock className="w-3 h-3 text-amber-600" /> : <CheckCircle2 className="w-3 h-3 text-green-700" />
                    )}
                    
                    {sentence.status === "pending" ? "Processing..." :
                     sentence.status === "error" ? "Raw Output" :
                     isTimeout ? "Auto 18s (Unmerged)" : "AI Phrased (Merged)"}
                  </span>
                  <span className="text-gray-500">
                    {new Date(sentence.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {/* Phrased Text */}
                <div className={`font-bold text-sm leading-snug ${
                  sentence.status === "pending" ? "text-indigo-900" :
                  sentence.status === "error" ? "text-red-900" :
                  "text-green-950"
                }`}>
                  {sentence.phrasedText || "Waiting for AI..."}
                </div>

                {/* Raw Tokens */}
                <div className="text-[10px] font-mono text-gray-500 truncate border-t border-black/5 pt-1.5 mt-auto">
                  Signed: {sentence.rawTokens.map(t => t.word).join(" → ")}
                </div>
              </div>
            );
          })}

          {isAccumulating && (
            <div className="flex-shrink-0 min-w-[200px] h-full flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin mb-1 opacity-50 text-indigo-600" />
              <span className="text-xs font-medium text-gray-600">Signing in progress...</span>
              <span className="text-[10px] font-mono text-gray-400">18s idle auto-dispatch</span>
            </div>
          )}
        </div>
      </div>

      {/* Full Conversation History Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-none flex items-center justify-center p-4">
          <div className="bg-white border border-gray-300 rounded-lg max-w-2xl w-full text-gray-900 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-gray-100 text-gray-900 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold tracking-tight text-gray-900">
                  Full Session ISL Conversation Log ({allLogs.length} Sentences)
                </h3>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {allLogs.map((item, idx) => (
                <div key={item.id || idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                    <span className="font-bold text-gray-700">Sentence #{idx + 1}</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    "{item.phrasedText}"
                  </div>
                  <div className="text-[11px] font-mono text-gray-500 flex flex-wrap gap-1">
                    <span className="font-semibold text-gray-600">Tokens:</span>
                    {item.rawTokens.map((t, ti) => (
                      <span key={ti} className="bg-white px-1.5 py-0.2 rounded border border-gray-300">
                        {t.word} ({t.confidence}%)
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowLogModal(false)}
                className="px-4 py-1.5 bg-gray-800 text-white font-medium text-xs rounded hover:bg-black"
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
