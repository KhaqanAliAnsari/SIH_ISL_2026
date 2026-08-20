export type SessionStatus = "LIVE" | "ESCALATED" | "COMPLETED";

export type StepStatus = "pending" | "in_progress" | "confirmed" | "needs_review";

export type DemoState =
  | "normal_recognition"
  | "liveness_code_step"
  | "low_confidence_or_escalated"
  | "session_complete";

export interface KYCField {
  id: string;
  label: string;
  aiValue: string;
  confidence: number; // 0 - 100
  isConfirmed: boolean;
  confirmedValue?: string;
  confirmedAt?: string;
  stepIndex: number;
  documentSource?: string;
  note?: string;
  retryCount?: number;
  reSignActive?: boolean;
}

export interface ProgressStep {
  id: string;
  label: string;
  status: StepStatus;
  description: string;
}

export interface SessionData {
  sessionId: string;
  timestamp: string;
  customerName: string;
  customerAadhaar: string;
  officialName: string;
  officialEmpId: string;
  branch: string;
  status: SessionStatus;
  fields: KYCField[];
  recordingDuration: string;
  livenessCode: string;
  confidenceAverage: number;
}

export interface Customer {
  id?: string;
  full_name: string;
  aadhaar_no: string;
  address: string;
  dob: string;
}

export type SentenceEngineState = "IDLE" | "ACCUMULATING" | "DISPATCHING" | "WAITING_RESPONSE";

export interface SentenceToken {
  word: string;
  confidence: number;
  timestamp: number;
}

export interface PhrasedSentence {
  id: string;
  rawTokens: SentenceToken[];
  phrasedText: string;
  corrections: string[];
  timestamp: number;
  status: "pending" | "done" | "error";
}
