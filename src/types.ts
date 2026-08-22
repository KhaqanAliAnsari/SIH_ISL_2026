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
  conversationHistory?: PhrasedSentence[];
  snapshots?: string[];
}

export interface Customer {
  id?: string;
  full_name: string;
  aadhaar_no: string;
  address: string;
  dob: string;
}

// ─── Sentence Formation Types ────────────────────────────────────────

export interface SentenceToken {
  word: string;          // The DTW-recognized gesture name (e.g., "hi", "my", "name", "r", "a", "m")
  confidence: number;    // DTW confidence at time of recognition (0-100)
  timestamp: number;     // Date.now() when recognized
}

export interface PhrasedSentence {
  id: string;                              // Unique ID (timestamp-based)
  rawTokens: SentenceToken[];              // Original DTW outputs in signing order
  phrasedText: string;                     // Gemini's reconstructed sentence
  corrections: string[];                   // List of inferences/corrections Gemini made
  timestamp: number;                       // When the phrased result was received
  status: 'pending' | 'done' | 'error';   // Processing status
}

export type SentenceEngineState = 'IDLE' | 'ACCUMULATING' | 'DISPATCHING' | 'WAITING_RESPONSE';
