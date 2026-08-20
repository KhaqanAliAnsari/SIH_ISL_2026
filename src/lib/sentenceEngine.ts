/**
 * sentenceEngine.ts
 *
 * Client-side sentence accumulation state machine.
 * Sits between the DTW engine and the cloud Gemini phrasing API.
 *
 * Flow:
 *   DTW recognizes gesture → sentenceEngine.pushGesture()
 *     - If gesture is "stop" → dispatch sentence to /api/phrase-sentence
 *     - Otherwise → accumulate token into buffer
 *
 * State Machine:
 *   IDLE → ACCUMULATING → DISPATCHING → WAITING_RESPONSE → IDLE
 */

import type { SentenceToken, PhrasedSentence, SentenceEngineState } from "../types";

// ─── Constants & Configuration ───────────────────────────────────────
const DEFAULT_STOP_GESTURE = "stop";
const MIN_TOKENS_TO_DISPATCH = 1;       // Minimum tokens required before sending to Gemini
const IDLE_TIMEOUT_MS = 18000;          // Auto-dispatch after 18s of no new tokens per user spec
const API_ENDPOINT = "/api/phrase-sentence";
const STORAGE_KEY_STOP_GESTURE = "signkyc_stop_gesture_name";

// ─── Callbacks ───────────────────────────────────────────────────────
export interface SentenceEngineCallbacks {
  onStateChange: (state: SentenceEngineState) => void;
  onTokensChange: (tokens: SentenceToken[]) => void;
  onSentenceComplete: (sentence: PhrasedSentence) => void;
  onError: (error: string) => void;
  onStopGestureChange?: (name: string) => void;
}

// ─── Engine State ────────────────────────────────────────────────────
let state: SentenceEngineState = "IDLE";
let tokenBuffer: SentenceToken[] = [];
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let callbacks: SentenceEngineCallbacks | null = null;
let sentenceCounter = 0;
let stopGestureName: string = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY_STOP_GESTURE) || DEFAULT_STOP_GESTURE;
  } catch {
    return DEFAULT_STOP_GESTURE;
  }
})();

export type DispatchReason = "manual" | "timeout";

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Configure which gesture name acts as the STOP / sentence delimiter sign.
 * Persists to localStorage so the user can customize it anytime.
 */
export function setStopGestureName(name: string): void {
  const sanitized = name.trim().toLowerCase() || DEFAULT_STOP_GESTURE;
  stopGestureName = sanitized;
  try {
    localStorage.setItem(STORAGE_KEY_STOP_GESTURE, sanitized);
  } catch (e) {
    console.warn("Could not persist stop gesture to localStorage:", e);
  }
  callbacks?.onStopGestureChange?.(sanitized);
  console.log(`[SentenceEngine] STOP gesture configured as: "${sanitized}"`);
}

/**
 * Get the currently configured STOP gesture name.
 */
export function getStopGestureName(): string {
  return stopGestureName;
}

/**
 * Initialize the sentence engine with callbacks.
 */
export function initSentenceEngine(cbs: SentenceEngineCallbacks): void {
  callbacks = cbs;
  state = "IDLE";
  tokenBuffer = [];
  sentenceCounter = 0;
  clearIdleTimer();
}

/**
 * Get the current engine state.
 */
export function getEngineState(): SentenceEngineState {
  return state;
}

/**
 * Get a copy of the current token buffer.
 */
export function getCurrentTokens(): SentenceToken[] {
  return [...tokenBuffer];
}

/**
 * Check if a gesture name matches the configured STOP delimiter.
 */
export function isStopGesture(gestureName: string): boolean {
  return gestureName.toLowerCase().trim() === stopGestureName.toLowerCase().trim();
}

/**
 * Push a recognized gesture into the sentence engine.
 * This is the main entry point called by the DTW recognition handler.
 *
 * - If the gesture is "stop", trigger sentence dispatch.
 * - Otherwise, accumulate the token.
 */
export function pushGesture(
  gesture: string,
  confidence: number
): void {
  // Ignore gestures while waiting for API response
  if (state === "DISPATCHING" || state === "WAITING_RESPONSE") {
    console.log(`[SentenceEngine] Ignoring gesture "${gesture}" — currently ${state}`);
    return;
  }

  if (isStopGesture(gesture)) {
    // ─── STOP sign → dispatch the accumulated sentence ───
    console.log("[SentenceEngine] STOP gesture detected — dispatching sentence");
    dispatchSentence("manual");
    return;
  }

  // ─── Prevent Consecutive Duplicate Gestures ───
  if (tokenBuffer.length > 0) {
    const lastToken = tokenBuffer[tokenBuffer.length - 1];
    if (lastToken.word === gesture) {
      console.log(`[SentenceEngine] Ignoring consecutive duplicate gesture "${gesture}"`);
      return;
    }
  }

  // ─── Accumulate token ───
  const token: SentenceToken = {
    word: gesture,
    confidence,
    timestamp: Date.now(),
  };

  tokenBuffer.push(token);

  // Transition to ACCUMULATING if we were IDLE
  if (state === "IDLE") {
    setState("ACCUMULATING");
  }

  callbacks?.onTokensChange([...tokenBuffer]);
  resetIdleTimer();

  console.log(
    `[SentenceEngine] Token added: "${gesture}" (${confidence}%) | Buffer: [${tokenBuffer.map(t => t.word).join(", ")}]`
  );
}

/**
 * Manually trigger sentence dispatch (e.g., from a UI button).
 */
export function manualDispatch(): void {
  if (state === "ACCUMULATING" && tokenBuffer.length > 0) {
    dispatchSentence("manual");
  }
}

/**
 * Reset the engine (clear tokens, go to IDLE).
 */
export function resetEngine(): void {
  clearIdleTimer();
  tokenBuffer = [];
  state = "IDLE";
  callbacks?.onStateChange("IDLE");
  callbacks?.onTokensChange([]);
}

// ─── Internal ────────────────────────────────────────────────────────

function setState(newState: SentenceEngineState): void {
  state = newState;
  callbacks?.onStateChange(newState);
}

function clearIdleTimer(): void {
  if (idleTimer !== null) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
}

function resetIdleTimer(): void {
  clearIdleTimer();
  if (IDLE_TIMEOUT_MS > 0 && state === "ACCUMULATING") {
    idleTimer = setTimeout(() => {
      console.log("[SentenceEngine] Idle timeout — auto-dispatching sentence");
      dispatchSentence("timeout");
    }, IDLE_TIMEOUT_MS);
  }
}

async function dispatchSentence(reason: DispatchReason): Promise<void> {
  clearIdleTimer();

  // Guard: need at least MIN_TOKENS_TO_DISPATCH tokens
  if (tokenBuffer.length < MIN_TOKENS_TO_DISPATCH) {
    console.log(
      `[SentenceEngine] Not enough tokens to dispatch (${tokenBuffer.length} < ${MIN_TOKENS_TO_DISPATCH})`
    );
    setState("IDLE");
    return;
  }

  const tokensToSend = [...tokenBuffer];
  const sentenceId = `sent_${Date.now()}_${++sentenceCounter}`;

  // Create a pending sentence object
  const pendingSentence: PhrasedSentence = {
    id: sentenceId,
    rawTokens: tokensToSend,
    phrasedText: "",
    corrections: [],
    timestamp: Date.now(),
    status: "pending",
  };

  // Clear buffer for next sentence
  tokenBuffer = [];
  callbacks?.onTokensChange([]);

  setState("DISPATCHING");

  // Notify with pending sentence (so UI can show spinner)
  callbacks?.onSentenceComplete(pendingSentence);

  setState("WAITING_RESPONSE");

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokens: tokensToSend.map(t => ({
          word: t.word,
          confidence: t.confidence,
        })),
        mergeLetters: reason === "manual",
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }

    const data = await response.json();

    const completedSentence: PhrasedSentence = {
      ...pendingSentence,
      phrasedText: data.sentence || tokensToSend.map(t => t.word).join(" "),
      corrections: data.corrections || [],
      timestamp: Date.now(),
      status: "done",
    };

    callbacks?.onSentenceComplete(completedSentence);
    console.log(`[SentenceEngine] Phrased: "${completedSentence.phrasedText}"`);
  } catch (err: any) {
    console.error("[SentenceEngine] API error:", err);

    // Fallback: join raw tokens
    const fallbackSentence: PhrasedSentence = {
      ...pendingSentence,
      phrasedText: tokensToSend.map(t => t.word).join(" "),
      corrections: ["API unavailable — showing raw tokens"],
      timestamp: Date.now(),
      status: "error",
    };

    callbacks?.onSentenceComplete(fallbackSentence);
    callbacks?.onError(err.message || "Failed to phrase sentence");
  } finally {
    setState("IDLE");
  }
}
