/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { Capacitor } from '@capacitor/core';
import { HeaderBar } from "./components/HeaderBar";
import { VideoPanel } from "./components/VideoPanel";
import { AIAssistPanel } from "./components/AIAssistPanel";
import { KYCProgressStrip } from "./components/KYCProgressStrip";
import { FooterControls } from "./components/FooterControls";
import { AuditModal } from "./components/AuditModal";
import { EditFieldModal } from "./components/EditFieldModal";
import { InterpreterModal } from "./components/InterpreterModal";
import { CustomerSideModal } from "./components/CustomerSideModal";
import { PhrasedSentenceStrip } from "./components/PhrasedSentenceStrip";
import {
  initSentenceEngine,
  pushGesture,
  getEngineState,
  getCurrentTokens
} from "./lib/sentenceEngine";
import {
  SessionStatus,
  DemoState,
  KYCField,
  ProgressStep,
  SessionData,
  Customer,
  SentenceEngineState,
  SentenceToken,
  PhrasedSentence,
} from "./types";
import { Login } from "./components/Login";
import { Registration } from "./components/Registration";
import { ApiSettingsModal } from "./components/ApiSettingsModal";

type AppView = 'login' | 'register' | 'console';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [pendingFullName, setPendingFullName] = useState('');
  const [pendingAadhaar, setPendingAadhaar] = useState('');

  // Sentence Engine State
  const [sentenceState, setSentenceState] = useState<SentenceEngineState>('IDLE');
  const [currentTokens, setCurrentTokens] = useState<SentenceToken[]>([]);
  const [phrasedQueue, setPhrasedQueue] = useState<PhrasedSentence[]>([]);
  const [fullConversationLog, setFullConversationLog] = useState<PhrasedSentence[]>(() => {
    try {
      const saved = localStorage.getItem("signkyc_session_conversation_log");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Demo State switcher
  const [demoState, setDemoState] = useState<DemoState>("normal_recognition");
  const [status, setStatus] = useState<SessionStatus>("LIVE");

  // Timer duration
  const [recordingSeconds, setRecordingSeconds] = useState(222); // 03:42

  // Customer & Session details
  const [sessionId] = useState("VCIP-2026-8942");
  const [timestamp] = useState("10 Aug 2026, 14:32 IST");
  const [officialName] = useState("Rajesh V.");
  const [empId] = useState("EMP-4092");
  const [branch] = useState("Bandra Kurla Complex");
  
  const customerName = customerData?.full_name || "Priya Sharma";
  const customerAadhaar = customerData?.aadhaar_no || "4829 1049 8821";
  
  const [livenessCode, setLivenessCode] = useState("8421");
  const [livenessMatchIndex, setLivenessMatchIndex] = useState(0);
  const [officialNotes, setOfficialNotes] = useState(
    "Identity document verified. Customer ISL sign clear."
  );
  const [snapshots, setSnapshots] = useState<string[]>([]);

  // Modals state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isInterpreterModalOpen, setIsInterpreterModalOpen] = useState(false);
  const [isCustomerViewOpen, setIsCustomerViewOpen] = useState(false);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [editingField, setEditingField] = useState<KYCField | null>(null);
  const [reSignFieldLabel, setReSignFieldLabel] = useState<string | null>(null);

  // 7 Progress Steps per RBI V-CIP
  const [steps, setSteps] = useState<ProgressStep[]>([
    {
      id: "doc",
      label: "Identity Document",
      status: "confirmed",
      description: "Aadhaar / PAN OCR",
    },
    {
      id: "name",
      label: "Name Confirmed",
      status: "confirmed",
      description: "Name Record Match",
    },
    {
      id: "address",
      label: "Address Confirmed",
      status: "in_progress",
      description: "ISL Verification",
    },
    {
      id: "photo",
      label: "Photo Captured",
      status: "confirmed",
      description: "Live Photo Match",
    },
    {
      id: "liveness",
      label: "Liveness Code",
      status: "pending",
      description: "Random 4-Digit Repeat",
    },
    {
      id: "consent",
      label: "Consent",
      status: "pending",
      description: "ISL Video Consent",
    },
    {
      id: "review",
      label: "Final Review",
      status: "pending",
      description: "Official Approval",
    },
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(2);

  // KYC Extracted Fields
  const [fields, setFields] = useState<KYCField[]>([
    {
      id: "1",
      label: "Full Name",
      aiValue: "Priya Sharma",
      confidence: 96,
      isConfirmed: true,
      confirmedValue: "Priya Sharma",
      confirmedAt: "14:30:12 IST",
      stepIndex: 1,
    },
    {
      id: "2",
      label: "Aadhaar / ID No.",
      aiValue: "4829 1049 8821",
      confidence: 94,
      isConfirmed: true,
      confirmedValue: "4829 1049 8821",
      confirmedAt: "14:31:05 IST",
      stepIndex: 0,
    },
    {
      id: "3",
      label: "Permanent Address",
      aiValue: "Plot 42, Park Street, Bandra West, Mumbai 400050",
      confidence: 89,
      isConfirmed: false,
      stepIndex: 2,
    },
    {
      id: "4",
      label: "Date of Birth",
      aiValue: "14/08/1994",
      confidence: 95,
      isConfirmed: true,
      confirmedValue: "14/08/1994",
      confirmedAt: "14:31:40 IST",
      stepIndex: 0,
    },
    {
      id: "5",
      label: "Liveness Code Repeat",
      aiValue: "8 - 4 - 2 - 1",
      confidence: 96,
      isConfirmed: false,
      stepIndex: 4,
    },
  ]);

  // Dynamic AI Translation State
  const [liveCaptionText, setLiveCaptionText] = useState(
    "MY PERMANENT ADDRESS IS PLOT 42, PARK STREET, BANDRA WEST, MUMBAI"
  );
  const [confidenceScore, setConfidenceScore] = useState(89);

  // Calculate Active Field based on first unconfirmed field or matching current step
  const activeField =
    fields.find((f) => !f.isConfirmed && f.stepIndex === currentStepIndex) ||
    fields.find((f) => !f.isConfirmed) ||
    null;

  useEffect(() => {
    if (customerData) {
      setFields((prev) => 
        prev.map(f => {
          if (f.id === "1") return { ...f, aiValue: customerData.full_name, confirmedValue: customerData.full_name };
          if (f.id === "2") return { ...f, aiValue: customerData.aadhaar_no, confirmedValue: customerData.aadhaar_no };
          if (f.id === "3") return { ...f, aiValue: customerData.address };
          if (f.id === "4") return { ...f, aiValue: customerData.dob, confirmedValue: customerData.dob };
          return f;
        })
      );
    }
  }, [customerData]);

  // Init Sentence Engine
  useEffect(() => {
    initSentenceEngine({
      onStateChange: (state) => setSentenceState(state),
      onTokensChange: (tokens) => setCurrentTokens(tokens),
      onSentenceComplete: (sentence) => {
        // 1. Update Full Conversation Log (all sentences preserved)
        setFullConversationLog((prev) => {
          const existingIdx = prev.findIndex(s => s.id === sentence.id);
          let newFull = [...prev];
          if (existingIdx >= 0) {
            newFull[existingIdx] = sentence;
          } else {
            newFull.push(sentence);
          }
          try {
            localStorage.setItem("signkyc_session_conversation_log", JSON.stringify(newFull));
          } catch (e) {
            console.warn("Could not save conversation log to localStorage:", e);
          }
          return newFull;
        });

        // 2. Update Active On-Screen Queue (capped at 5 visible sentences max)
        setPhrasedQueue((prev) => {
          const existingIdx = prev.findIndex(s => s.id === sentence.id);
          let newQueue = [...prev];
          
          if (existingIdx >= 0) {
            newQueue[existingIdx] = sentence;
          } else {
            newQueue.push(sentence);
          }

          // Keep only the last 5 sentences in the active queue
          if (newQueue.length > 5) {
            newQueue = newQueue.slice(newQueue.length - 5);
          }
          return newQueue;
        });
      },
      onError: (err) => console.error("Sentence engine error:", err)
    });
  }, []);

  // Recording timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSelectDemoState = (nextState: DemoState) => {
    setDemoState(nextState);

    if (nextState === "normal_recognition") {
      setStatus("LIVE");
      setConfidenceScore(89);
      setLiveCaptionText(
        "MY PERMANENT ADDRESS IS PLOT 42, PARK STREET, BANDRA WEST, MUMBAI"
      );
      setCurrentStepIndex(2);
      setSteps((prev) =>
        prev.map((s, idx) => {
          if (idx <= 1) return { ...s, status: "confirmed" };
          if (idx === 2) return { ...s, status: "in_progress" };
          return { ...s, status: "pending" };
        })
      );
    } else if (nextState === "liveness_code_step") {
      setStatus("LIVE");
      setConfidenceScore(96);
      setLivenessMatchIndex(0);
      setLiveCaptionText(`LIVENESS CODE PROMPTED: ${livenessCode.split("").join(" ... ")}`);
      setCurrentStepIndex(4);
      setSteps((prev) =>
        prev.map((s, idx) => {
          if (idx <= 3) return { ...s, status: "confirmed" };
          if (idx === 4) return { ...s, status: "in_progress" };
          return { ...s, status: "pending" };
        })
      );
    } else if (nextState === "low_confidence_or_escalated") {
      setStatus("ESCALATED");
      setConfidenceScore(58);
      setLiveCaptionText(
        "SIGNING REGIONAL ISL DIALECT... CERTIFIED INTERPRETER ANANYA M. (#INT-104) BRIDGED."
      );
      setCurrentStepIndex(2);
      setSteps((prev) =>
        prev.map((s, idx) => {
          if (idx === 2) return { ...s, status: "needs_review" };
          return s;
        })
      );
    } else if (nextState === "session_complete") {
      setStatus("COMPLETED");
      setConfidenceScore(95);
      setLiveCaptionText(
        "ALL KYC FIELDS CONFIRMED BY OFFICIAL. CUSTOMER GAVE ISL CONSENT."
      );
      setCurrentStepIndex(6);
      setSteps((prev) => prev.map((s) => ({ ...s, status: "confirmed" })));
      setFields((prev) =>
        prev.map((f) => ({
          ...f,
          isConfirmed: true,
          confirmedValue: f.confirmedValue || f.aiValue,
          confirmedAt: f.confirmedAt || "14:32 IST",
        }))
      );
      setIsAuditModalOpen(true);
    }
  };

  const handleConfirmField = (fieldId: string) => {
    const timeStr = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId) {
          return {
            ...f,
            isConfirmed: true,
            confirmedValue: f.aiValue,
            confirmedAt: `${timeStr} IST`,
          };
        }
        return f;
      })
    );

    setSteps((prev) => {
      const copy = [...prev];
      if (fieldId === "3") {
        copy[2] = { ...copy[2], status: "confirmed" };
        copy[3] = { ...copy[3], status: "in_progress" };
        setCurrentStepIndex(3);
      } else if (fieldId === "5") {
        copy[4] = { ...copy[4], status: "confirmed" };
        copy[5] = { ...copy[5], status: "in_progress" };
        setCurrentStepIndex(5);
      }
      return copy;
    });
  };

  const handleRequestReSign = (field: KYCField) => {
    const currentRetries = (field.retryCount || 0) + 1;

    setFields((prev) =>
      prev.map((f) => {
        if (f.id === field.id) {
          return {
            ...f,
            retryCount: currentRetries,
            reSignActive: true,
          };
        }
        return f;
      })
    );

    setReSignFieldLabel(field.label);

    // After 2 retries, auto-suggest Escalate to Interpreter
    if (currentRetries >= 2) {
      setTimeout(() => {
        setIsInterpreterModalOpen(true);
      }, 1500);
    }

    // Reset reSignActive after 4s
    setTimeout(() => {
      setFields((prev) =>
        prev.map((f) => {
          if (f.id === field.id) {
            return { ...f, reSignActive: false };
          }
          return f;
        })
      );
    }, 4000);
  };

  const handleSaveFieldEdit = (fieldId: string, newValue: string) => {
    const timeStr = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId) {
          return {
            ...f,
            isConfirmed: true,
            confirmedValue: newValue,
            confirmedAt: `${timeStr} IST (Edited)`,
          };
        }
        return f;
      })
    );
  };

  const handleTriggerLiveness = () => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    setLivenessCode(newCode);
    setLivenessMatchIndex(0);
    setLiveCaptionText(`LIVENESS CODE PROMPTED: ${newCode.split("").join(" ... ")}`);
    handleSelectDemoState("liveness_code_step");
  };

  const handleConnectInterpreter = () => {
    setStatus("ESCALATED");
    setDemoState("low_confidence_or_escalated");
    setLiveCaptionText(
      "CERTIFIED ISL INTERPRETER ANANYA M. (#INT-104) BRIDGED INTO CALL."
    );
  };

  const isAllConfirmed = fields.every((f) => f.isConfirmed);

  // DTW Gesture Recognition Handler
  const handleGestureRecognized = useCallback(
    (gesture: string, distance: number, confidence: number) => {
      // 1. Keep existing live caption behavior
      setLiveCaptionText(
        `RECOGNIZED ISL GESTURE: "${gesture.toUpperCase()}" (DTW: ${distance.toFixed(1)})`
      );
      setConfidenceScore(confidence);
      
      // 2. Feed to sentence engine
      pushGesture(gesture, confidence);

      // 3. Liveness sequence matching — check if signed digit matches next expected
      setLivenessMatchIndex((prevIdx) => {
        // Only match during the liveness step and if not already fully matched
        if (prevIdx >= livenessCode.length) return prevIdx;

        const expectedDigit = livenessCode[prevIdx];
        const signedGesture = gesture.trim().toLowerCase();

        // Match the gesture name against the expected digit
        // Supports both digit string ("8") and word form ("eight")
        const digitWords: Record<string, string> = {
          "0": "zero", "1": "one", "2": "two", "3": "three", "4": "four",
          "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine",
        };
        const isMatch =
          signedGesture === expectedDigit ||
          signedGesture === digitWords[expectedDigit];

        if (isMatch) {
          const nextIdx = prevIdx + 1;
          if (nextIdx >= livenessCode.length) {
            // All digits matched! Auto-confirm the liveness field
            setLiveCaptionText(`LIVENESS VERIFIED: All ${livenessCode.length} digits matched in sequence`);
            // Auto-confirm liveness KYC field (id "5")
            setTimeout(() => {
              setFields((prev) =>
                prev.map((f) =>
                  f.id === "5"
                    ? {
                        ...f,
                        isConfirmed: true,
                        confirmedValue: livenessCode.split("").join(" - "),
                        confirmedAt: new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
                      }
                    : f
                )
              );
            }, 500);
          } else {
            setLiveCaptionText(
              `LIVENESS: Matched digit ${expectedDigit} (${nextIdx}/${livenessCode.length})`
            );
          }
          return nextIdx;
        }
        return prevIdx;
      });
    },
    [livenessCode]
  );

  const currentSessionData: SessionData = {
    sessionId,
    timestamp,
    customerName,
    customerAadhaar,
    officialName,
    officialEmpId: empId,
    branch,
    status,
    fields,
    recordingDuration: formatDuration(recordingSeconds),
    livenessCode,
    confidenceAverage: confidenceScore,
    conversationHistory: fullConversationLog,
    snapshots,
  };

  if (currentView === 'login') {
    return <Login 
      onSuccess={(customer) => {
        setCustomerData(customer);
        setCurrentView('console');
      }} 
      onRegister={(name, aadhaar) => {
        setPendingFullName(name);
        setPendingAadhaar(aadhaar);
        setCurrentView('register');
      }} 
    />;
  }

  if (currentView === 'register') {
    return <Registration 
      initialFullName={pendingFullName}
      initialAadhaarNo={pendingAadhaar}
      onSuccess={(customer) => {
        setCustomerData(customer);
        setCurrentView('console');
      }}
      onCancel={() => setCurrentView('login')}
    />;
  }
  // Detect native mobile (Capacitor) or explicit native URL flag for testing on PC
  const isNativeApp = Capacitor.isNativePlatform() || new URLSearchParams(window.location.search).has('native');

  return (
    <div 
      className="w-full h-full min-h-[100dvh] font-sans flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden select-none"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)'
      }}
    >
      {/* 1. Header Bar */}
      <HeaderBar
        status={status}
        demoState={demoState}
        onSelectDemoState={handleSelectDemoState}
        sessionId={sessionId}
        timestamp={timestamp}
        officialName={officialName}
        empId={empId}
        branch={branch}
        onOpenCustomerView={() => setIsCustomerViewOpen(true)}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
      />

      {/* 2. Main Workstation Area */}
      <main className="flex-1 p-3 flex flex-col lg:grid lg:grid-cols-12 gap-3 min-h-0 overflow-y-auto lg:overflow-hidden">
        <VideoPanel
          demoState={demoState}
          livenessCode={livenessCode}
          livenessMatchIndex={livenessMatchIndex}
          recordingDuration={formatDuration(recordingSeconds)}
          customerName={customerName}
          customerAadhaar={customerAadhaar}
          onCaptureSnapshot={(dataUrl) => {
            setSnapshots((prev) => [...prev, dataUrl]);
            alert("HD Snapshot captured & logged to RBI Audit Trail.");
          }}
          onTriggerLiveness={handleTriggerLiveness}
          currentStepLabel={
            steps[currentStepIndex]?.label || "Identity Verification"
          }
          onGestureRecognized={handleGestureRecognized}
          currentSentenceTokens={currentTokens}
          sentenceEngineState={sentenceState}
          forceStopCamera={isAuditModalOpen}
        />
        <AIAssistPanel
          demoState={demoState}
          fields={fields}
          activeField={activeField}
          onConfirmField={handleConfirmField}
          onEditField={(f) => setEditingField(f)}
          onRequestReSign={handleRequestReSign}
          onEscalateToInterpreter={() => setIsInterpreterModalOpen(true)}
          liveCaptionText={liveCaptionText}
          confidenceScore={confidenceScore}
          livenessCode={livenessCode}
          livenessMatchIndex={livenessMatchIndex}
        />
      </main>

      {/* 2.5 Phrased Sentence History Strip (Queue size 5 + Full Log modal) */}
      <PhrasedSentenceStrip 
        sentences={phrasedQueue}
        fullHistory={fullConversationLog}
        sentenceState={sentenceState}
        currentTokens={currentTokens}
      />

      {/* 3. KYC Progress Strip */}
      <KYCProgressStrip
        steps={steps}
        currentStepIndex={currentStepIndex}
        onSelectStep={(idx) => setCurrentStepIndex(idx)}
      />

      {/* 4. Footer Controls */}
      <FooterControls
        notes={officialNotes}
        onNotesChange={setOfficialNotes}
        onSaveLater={() => alert("Session draft saved to local server.")}
        onEndSession={() => {
          if (confirm("End Video-CIP session and generate audit summary?")) {
            setIsAuditModalOpen(true);
          }
        }}
        onSubmitAudit={() => setIsAuditModalOpen(true)}
        isAllConfirmed={isAllConfirmed}
      />

      {/* Modals */}
      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        sessionData={currentSessionData}
        fields={fields}
      />

      <EditFieldModal
        field={editingField}
        isOpen={!!editingField}
        onClose={() => setEditingField(null)}
        onSave={handleSaveFieldEdit}
      />

      <InterpreterModal
        isOpen={isInterpreterModalOpen}
        onClose={() => setIsInterpreterModalOpen(false)}
        onConnect={handleConnectInterpreter}
      />

      <CustomerSideModal
        isOpen={isCustomerViewOpen}
        onClose={() => setIsCustomerViewOpen(false)}
        reSignFieldLabel={reSignFieldLabel}
        livenessCode={livenessCode}
        livenessMatchIndex={livenessMatchIndex}
        isLivenessStep={demoState === "liveness_code_step"}
        customerName={customerName}
      />

      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
      />
    </div>
  );
}
