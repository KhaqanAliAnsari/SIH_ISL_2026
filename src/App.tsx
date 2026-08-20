/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { HeaderBar } from "./components/HeaderBar";
import { VideoPanel } from "./components/VideoPanel";
import { AIAssistPanel } from "./components/AIAssistPanel";
import { KYCProgressStrip } from "./components/KYCProgressStrip";
import { FooterControls } from "./components/FooterControls";
import { AuditModal } from "./components/AuditModal";
import { EditFieldModal } from "./components/EditFieldModal";
import { InterpreterModal } from "./components/InterpreterModal";
import { CustomerSideModal } from "./components/CustomerSideModal";
import { initHolisticLandmarker } from "./lib/holisticLandmarker";
import { loadTemplates } from "./lib/dtwEngine";
import {
  SessionStatus,
  DemoState,
  KYCField,
  ProgressStep,
  SessionData,
  Customer,
} from "./types";
import { Login } from "./components/Login";
import { Registration } from "./components/Registration";
import { 
  initSentenceEngine, 
  pushGesture, 
  resetEngine, 
  manualDispatch 
} from "./lib/sentenceEngine";

type AppView = 'login' | 'register' | 'console';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [pendingFullName, setPendingFullName] = useState('');
  const [pendingAadhaar, setPendingAadhaar] = useState('');

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
  
  const [livenessCode, setLivenessCode] = useState("8429");
  const [officialNotes, setOfficialNotes] = useState(
    "Identity document verified. Customer ISL sign clear."
  );

  // Modals state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isInterpreterModalOpen, setIsInterpreterModalOpen] = useState(false);
  const [isCustomerViewOpen, setIsCustomerViewOpen] = useState(false);
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
      aiValue: "8 - 4 - 2 - 9",
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

  // Eagerly load MediaPipe and DTW templates globally on app start, but defer slightly
  // to prevent the heavy WASM compilation from freezing the initial page render.
  useEffect(() => {
    const initTimer = setTimeout(() => {
      initHolisticLandmarker().catch(err => console.error("Global init model error:", err));
      loadTemplates().catch(err => console.error("Global init templates error:", err));
    }, 500);

    // Initialize sentence engine for compound fields
    initSentenceEngine({
      onStateChange: (state) => {
        if (state === "WAITING_RESPONSE") {
          setLiveCaptionText("TRANSLATING TO ENGLISH VIA GEMINI...");
        } else if (state === "IDLE") {
          // Reset when done
        }
      },
      onTokensChange: (tokens) => {
        if (tokens.length > 0) {
          // Step 4: Immediate raw-token display
          setLiveCaptionText(`[ISL TOKENS] ${tokens.map(t => t.word.toUpperCase()).join(" ")}`);
        }
      },
      onSentenceComplete: (sentence) => {
        if (sentence.status === "done") {
          setLiveCaptionText(`[GEMINI NLP] ${sentence.phrasedText}`);
          // Auto-fill the address field (id: "3") with the phrased text
          setFields((prev) =>
            prev.map((f) => (f.id === "3" ? { ...f, aiValue: sentence.phrasedText } : f))
          );
        } else if (sentence.status === "error") {
          setLiveCaptionText(`[NLP ERROR] ${sentence.phrasedText}`);
        }
      },
      onError: (err) => console.error("Sentence Engine:", err),
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
      setLiveCaptionText("REPEATING LIVENESS CODE: 8 ... 4 ... 2 ... 9");
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
    setLiveCaptionText(`REPEATING LIVENESS CODE: ${newCode.split("").join(" ... ")}`);
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
      setConfidenceScore(confidence);
      
      const activeF = fields.find((f) => !f.isConfirmed && f.stepIndex === currentStepIndex) || fields.find((f) => !f.isConfirmed);

      // Step 4: Gate Gemini calls to compound fields only (e.g. "Address" which is id "3")
      if (activeF && activeF.id === "3") {
        // Send to sentence engine (accumulates and eventually hits Gemini)
        pushGesture(gesture, confidence);
      } else {
        // Bypass Gemini: Simple raw-token concatenation for Liveness Code, DOB, etc.
        setLiveCaptionText((prev) => {
          if (prev.includes("REPEATING") || prev.includes("RECOGNIZED") || prev.includes("TRANSLATING")) {
             return `[RAW] ${gesture.toUpperCase()}`;
          }
          return `${prev} ${gesture.toUpperCase()}`;
        });

        if (activeF) {
          setFields((prev) =>
            prev.map((f) => {
              if (f.id === activeF.id) {
                // For liveness code (id "5"), format with dashes
                const append = f.id === "5" ? ` - ${gesture.toUpperCase()}` : ` ${gesture.toUpperCase()}`;
                const baseValue = f.aiValue.includes("8 - 4") ? "" : f.aiValue; // clear placeholder
                return { ...f, aiValue: baseValue ? `${baseValue}${append}` : gesture.toUpperCase() };
              }
              return f;
            })
          );
        }
      }
    },
    [fields, currentStepIndex]
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

  return (
    <div className="w-full h-full min-h-screen font-sans flex flex-col bg-zinc-950 text-zinc-300 overflow-hidden select-none">
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
      />

      {/* 2. Main Workstation Area */}
      <main className="flex-1 p-3 grid grid-cols-12 gap-3 min-h-0 overflow-hidden">
        <VideoPanel
          demoState={demoState}
          livenessCode={livenessCode}
          recordingDuration={formatDuration(recordingSeconds)}
          customerName={customerName}
          customerAadhaar={customerAadhaar}
          onCaptureSnapshot={() =>
            alert("HD Snapshot captured & logged to RBI Audit Trail.")
          }
          onTriggerLiveness={handleTriggerLiveness}
          currentStepLabel={
            steps[currentStepIndex]?.label || "Identity Verification"
          }
          onGestureRecognized={handleGestureRecognized}
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
        />
      </main>

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
        isLivenessStep={demoState === "liveness_code_step"}
        customerName={customerName}
      />
    </div>
  );
}
