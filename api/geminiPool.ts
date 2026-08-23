/**
 * geminiPool.ts
 *
 * Resilient Gemini API client pool with:
 *   - Multi-key round-robin rotation (up to 4 keys)
 *   - Per-key rate limiting via token bucket (stays under 15 RPM free-tier)
 *   - Automatic cooldown when a key hits 429
 *   - Exponential backoff retries across keys
 *   - LRU cache with TTL to minimize redundant API calls
 *   - In-flight request deduplication
 */

import { GoogleGenAI } from "@google/genai";

// ─── Configuration ───────────────────────────────────────────────────

const MAX_RPM_PER_KEY = 13;          // Stay safely under the 15 RPM free-tier ceiling
const COOLDOWN_MS = 65_000;          // How long to sideline a key after a 429 (65s > 1 minute window)
const MAX_RETRIES = 3;               // Total retry attempts across all keys
const BASE_BACKOFF_MS = 1_500;       // Initial backoff delay
const MAX_BACKOFF_MS = 15_000;       // Cap on backoff delay
const CACHE_MAX_SIZE = 500;          // Max LRU cache entries
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL for cached responses
const RATE_WINDOW_MS = 60_000;       // 1-minute sliding window for rate tracking

// ─── Types ───────────────────────────────────────────────────────────

interface KeyState {
  apiKey: string;
  client: GoogleGenAI;
  /** Timestamps of requests made within the current rate window */
  requestTimestamps: number[];
  /** If set, this key is cooling down until this epoch ms */
  cooldownUntil: number;
  /** Total requests made (for logging) */
  totalRequests: number;
  /** Label for logging (e.g., "KEY_1") */
  label: string;
}

interface CacheEntry {
  value: any;
  createdAt: number;
}

export interface GenerateOptions {
  model: string;
  contents: string;
  config?: {
    responseMimeType?: string;
    temperature?: number;
  };
}

// ─── LRU Cache ───────────────────────────────────────────────────────

class LRUCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private ttlMs: number;

  constructor(maxSize: number, ttlMs: number) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }

  get(key: string): any | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check TTL
    if (Date.now() - entry.createdAt > this.ttlMs) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used) — delete and re-insert
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: any): void {
    // If key already exists, delete first to update insertion order
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Evict oldest entries if at capacity
    while (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, { value, createdAt: Date.now() });
  }

  get size(): number {
    return this.cache.size;
  }
}

// ─── Gemini Key Pool ─────────────────────────────────────────────────

class GeminiKeyPool {
  private keys: KeyState[] = [];
  private roundRobinIndex = 0;
  private cache = new LRUCache(CACHE_MAX_SIZE, CACHE_TTL_MS);
  /** Map of cacheKey → in-flight Promise, for deduplication */
  private inFlight = new Map<string, Promise<any>>();

  constructor() {
    this.initializeKeys();
  }

  /**
   * Read API keys from environment and build the pool.
   * Supports: GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3, GEMINI_API_KEY_4
   */
  private initializeKeys(): void {
    const envNames = [
      "GEMINI_API_KEY",
      "GEMINI_API_KEY_2",
      "GEMINI_API_KEY_3",
      "GEMINI_API_KEY_4",
    ];

    for (let i = 0; i < envNames.length; i++) {
      const apiKey = process.env[envNames[i]];
      if (apiKey && apiKey.trim().length > 0) {
        this.keys.push({
          apiKey: apiKey.trim(),
          client: new GoogleGenAI({
            apiKey: apiKey.trim(),
            httpOptions: {
              headers: { "User-Agent": "aistudio-build" },
            },
          }),
          requestTimestamps: [],
          cooldownUntil: 0,
          totalRequests: 0,
          label: `KEY_${i + 1}`,
        });
      }
    }

    if (this.keys.length > 0) {
      console.log(
        `[GeminiPool] Initialized with ${this.keys.length} API key(s): ${this.keys
          .map((k) => k.label)
          .join(", ")}. Effective RPM capacity: ~${this.keys.length * MAX_RPM_PER_KEY}`
      );
    } else {
      console.warn("[GeminiPool] No API keys found — all Gemini calls will use fallback responses.");
    }
  }

  /** Whether the pool has any usable keys at all */
  get isAvailable(): boolean {
    return this.keys.length > 0;
  }

  /**
   * Prune timestamps outside the current rate window for a key.
   */
  private pruneTimestamps(key: KeyState): void {
    const cutoff = Date.now() - RATE_WINDOW_MS;
    key.requestTimestamps = key.requestTimestamps.filter((ts) => ts > cutoff);
  }

  /**
   * Check if a key is currently usable (not cooling down and under rate limit).
   */
  private isKeyUsable(key: KeyState): boolean {
    const now = Date.now();

    // Check cooldown
    if (key.cooldownUntil > now) {
      return false;
    }

    // Prune old timestamps and check rate
    this.pruneTimestamps(key);
    return key.requestTimestamps.length < MAX_RPM_PER_KEY;
  }

  /**
   * Select the next usable key via round-robin.
   * Returns null if all keys are exhausted/cooling.
   */
  private selectKey(): KeyState | null {
    if (this.keys.length === 0) return null;

    // Try each key starting from current round-robin position
    for (let attempt = 0; attempt < this.keys.length; attempt++) {
      const idx = (this.roundRobinIndex + attempt) % this.keys.length;
      const key = this.keys[idx];

      if (this.isKeyUsable(key)) {
        // Advance round-robin to the NEXT key for the following request
        this.roundRobinIndex = (idx + 1) % this.keys.length;
        return key;
      }
    }

    return null;
  }

  /**
   * Mark a key as needing cooldown (e.g., after a 429 response).
   */
  private markKeyCooldown(key: KeyState, durationMs: number = COOLDOWN_MS): void {
    key.cooldownUntil = Date.now() + durationMs;
    console.warn(
      `[GeminiPool] ${key.label} hit rate limit — cooling down for ${Math.round(durationMs / 1000)}s`
    );
  }

  /**
   * Record that a request was made with this key.
   */
  private recordRequest(key: KeyState): void {
    key.requestTimestamps.push(Date.now());
    key.totalRequests++;
  }

  /**
   * Check if an error is a rate-limit (429) error.
   */
  private isRateLimitError(err: any): boolean {
    if (!err) return false;
    const message = String(err.message || err).toLowerCase();
    const status = err.status || err.statusCode || err.code;
    return (
      status === 429 ||
      message.includes("429") ||
      message.includes("resource_exhausted") ||
      message.includes("rate limit") ||
      message.includes("quota exceeded") ||
      message.includes("too many requests")
    );
  }

  /**
   * Parse a Retry-After value from an error (if present).
   * Returns milliseconds to wait, or the default cooldown.
   */
  private parseRetryAfter(err: any): number {
    try {
      const retryAfter =
        err?.headers?.["retry-after"] ||
        err?.response?.headers?.["retry-after"];
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        if (!isNaN(seconds) && seconds > 0) {
          return Math.min(seconds * 1000, 120_000); // Cap at 2 minutes
        }
      }
    } catch {
      // Ignore parse errors
    }
    return COOLDOWN_MS;
  }

  /**
   * Core method: Make a Gemini API call with full resilience.
   *
   * - Checks cache first
   * - Deduplicates in-flight requests
   * - Retries across keys with exponential backoff
   * - Returns parsed JSON response or throws after all retries exhausted
   */
  async generateContent(
    options: GenerateOptions,
    cacheKey?: string
  ): Promise<any> {
    // ── Cache check ──
    if (cacheKey) {
      const cached = this.cache.get(cacheKey);
      if (cached !== undefined) {
        console.log(`[GeminiPool] Cache HIT for key: ${cacheKey.substring(0, 50)}...`);
        return cached;
      }

      // ── In-flight deduplication ──
      const existing = this.inFlight.get(cacheKey);
      if (existing) {
        console.log(`[GeminiPool] Dedup — reusing in-flight request for: ${cacheKey.substring(0, 50)}...`);
        return existing;
      }
    }

    // ── Create the request promise (with retry logic) ──
    const requestPromise = this._executeWithRetries(options, cacheKey);

    // Register in-flight
    if (cacheKey) {
      this.inFlight.set(cacheKey, requestPromise);
    }

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up in-flight tracker
      if (cacheKey) {
        this.inFlight.delete(cacheKey);
      }
    }
  }

  /**
   * Internal: Execute a Gemini API call with retries across keys.
   */
  private async _executeWithRetries(
    options: GenerateOptions,
    cacheKey?: string
  ): Promise<any> {
    let lastError: any = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const key = this.selectKey();

      if (!key) {
        // All keys exhausted — wait a bit and retry
        const waitMs = Math.min(BASE_BACKOFF_MS * Math.pow(2, attempt), MAX_BACKOFF_MS);
        console.warn(
          `[GeminiPool] All keys exhausted on attempt ${attempt + 1}/${MAX_RETRIES}. ` +
          `Waiting ${waitMs}ms before retry...`
        );
        await this._sleep(waitMs);
        continue;
      }

      try {
        this.recordRequest(key);

        console.log(
          `[GeminiPool] Attempt ${attempt + 1}/${MAX_RETRIES} using ${key.label} ` +
          `(${key.requestTimestamps.length}/${MAX_RPM_PER_KEY} RPM used, total: ${key.totalRequests})`
        );

        const response = await key.client.models.generateContent({
          model: options.model,
          contents: options.contents,
          config: options.config,
        });

        const responseText = response.text || "{}";
        const parsed = JSON.parse(responseText);

        // ── Store in cache ──
        if (cacheKey) {
          this.cache.set(cacheKey, parsed);
        }

        return parsed;
      } catch (err: any) {
        lastError = err;

        if (this.isRateLimitError(err)) {
          // Mark this key for cooldown and try the next one
          const cooldownMs = this.parseRetryAfter(err);
          this.markKeyCooldown(key, cooldownMs);

          console.warn(
            `[GeminiPool] ${key.label} returned 429 on attempt ${attempt + 1}. Rotating to next key...`
          );
          // No sleep here — we immediately try the next key
          continue;
        }

        // Non-rate-limit error — backoff and retry
        const backoffMs = Math.min(BASE_BACKOFF_MS * Math.pow(2, attempt), MAX_BACKOFF_MS);
        console.error(
          `[GeminiPool] ${key.label} failed (non-429) on attempt ${attempt + 1}: ${err.message}. ` +
          `Backing off ${backoffMs}ms...`
        );
        await this._sleep(backoffMs);
      }
    }

    // All retries exhausted
    throw new Error(
      `[GeminiPool] All ${MAX_RETRIES} retry attempts failed across ${this.keys.length} key(s). ` +
      `Last error: ${lastError?.message || "Unknown error"}`
    );
  }

  /**
   * Get pool status for debugging / health checks.
   */
  getStatus(): {
    totalKeys: number;
    availableKeys: number;
    cacheSize: number;
    inFlightCount: number;
    keys: { label: string; usable: boolean; rpm: number; totalRequests: number; coolingUntilStr: string }[];
  } {
    const now = Date.now();
    return {
      totalKeys: this.keys.length,
      availableKeys: this.keys.filter((k) => this.isKeyUsable(k)).length,
      cacheSize: this.cache.size,
      inFlightCount: this.inFlight.size,
      keys: this.keys.map((k) => {
        this.pruneTimestamps(k);
        return {
          label: k.label,
          usable: this.isKeyUsable(k),
          rpm: k.requestTimestamps.length,
          totalRequests: k.totalRequests,
          coolingUntilStr:
            k.cooldownUntil > now
              ? `${Math.round((k.cooldownUntil - now) / 1000)}s remaining`
              : "none",
        };
      }),
    };
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ─── Singleton Export ────────────────────────────────────────────────

export const geminiPool = new GeminiKeyPool();

/**
 * Build a normalized cache key for phrase-sentence requests.
 * Normalizes casing, trims whitespace, and buckets confidence into bands
 * to maximize cache hit rate for near-identical inputs.
 */
export function buildPhraseCacheKey(
  tokens: { word: string; confidence?: number }[],
  mergeLetters: boolean
): string {
  const mode = mergeLetters ? "merge" : "separate";
  const normalized = tokens
    .map((t) => {
      const word = t.word.toLowerCase().trim();
      // Bucket confidence into bands of 10 (e.g., 85 → 80, 92 → 90)
      const confBand = Math.floor((t.confidence || 0) / 10) * 10;
      return `${word}_${confBand}`;
    })
    .join("|");
  return `${mode}:${normalized}`;
}
