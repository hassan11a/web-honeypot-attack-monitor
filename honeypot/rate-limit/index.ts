import { ipKey } from "@/lib/ip";

export interface RateLimitDecision {
  allowed: boolean;
  /** Milliseconds to delay before responding (0 = no delay). */
  delayMs: number;
  /** Elevated monitoring for this source. */
  elevated: boolean;
  remaining: number;
  retryAfterSeconds: number;
  requestCountInWindow: number;
  authAttemptsInWindow: number;
  sensitiveHitsInWindow: number;
}

interface Bucket {
  windowStart: number;
  count: number;
  authAttempts: number;
  sensitiveHits: number;
  elevatedUntil: number;
}

export interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
  delayMs: number;
  authThreshold: number;
  sensitiveThreshold: number;
}

const DEFAULTS: RateLimiterOptions = {
  maxRequests: 120,
  windowMs: 60_000,
  delayMs: 0,
  authThreshold: 5,
  sensitiveThreshold: 10,
};

export class RateLimiter {
  private buckets = new Map<string, Bucket>();
  private options: RateLimiterOptions;
  private lastSweep = Date.now();

  constructor(options: Partial<RateLimiterOptions> = {}) {
    this.options = { ...DEFAULTS, ...options };
  }

  configure(options: Partial<RateLimiterOptions>): void {
    this.options = { ...this.options, ...options };
  }

  get maxRequests(): number {
    return this.options.maxRequests;
  }

  private sweep(now: number): void {
    if (now - this.lastSweep < 60_000) return;
    this.lastSweep = now;
    for (const [key, bucket] of this.buckets) {
      if (now - bucket.windowStart > Math.max(this.options.windowMs, 60_000) * 5 && now > bucket.elevatedUntil) {
        this.buckets.delete(key);
      }
    }
  }

  check(input: {
    ip: string;
    isAuthPath?: boolean;
    isSensitivePath?: boolean;
    forceSuspicious?: boolean;
  }): RateLimitDecision {
    const now = Date.now();
    this.sweep(now);
    const key = ipKey(input.ip);
    let bucket = this.buckets.get(key);
    if (!bucket || now - bucket.windowStart >= this.options.windowMs) {
      bucket = {
        windowStart: now,
        count: 0,
        authAttempts: 0,
        sensitiveHits: 0,
        elevatedUntil: bucket?.elevatedUntil ?? 0,
      };
      this.buckets.set(key, bucket);
    }

    bucket.count += 1;
    if (input.isAuthPath) bucket.authAttempts += 1;
    if (input.isSensitivePath) bucket.sensitiveHits += 1;
    if (input.forceSuspicious) {
      bucket.elevatedUntil = now + this.options.windowMs * 5;
    }
    if (bucket.authAttempts >= this.options.authThreshold || bucket.sensitiveHits >= this.options.sensitiveThreshold) {
      bucket.elevatedUntil = now + this.options.windowMs * 5;
    }

    const overLimit = bucket.count > this.options.maxRequests;
    const elevated = now < bucket.elevatedUntil;
    const retryAfterSeconds = Math.ceil((bucket.windowStart + this.options.windowMs - now) / 1000);

    return {
      allowed: !overLimit,
      delayMs: overLimit ? Math.min(this.options.delayMs, 5000) : 0,
      elevated,
      remaining: Math.max(0, this.options.maxRequests - bucket.count),
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
      requestCountInWindow: bucket.count,
      authAttemptsInWindow: bucket.authAttempts,
      sensitiveHitsInWindow: bucket.sensitiveHits,
    };
  }

  /** Records auth/sensitive hits without counting toward the request limit (for login traps). */
  note(input: { ip: string; isAuthPath?: boolean; isSensitivePath?: boolean; forceSuspicious?: boolean }): void {
    const now = Date.now();
    const key = ipKey(input.ip);
    const bucket = this.buckets.get(key);
    if (!bucket) return;
    if (input.isAuthPath) bucket.authAttempts += 1;
    if (input.isSensitivePath) bucket.sensitiveHits += 1;
    if (input.forceSuspicious) bucket.elevatedUntil = now + this.options.windowMs * 5;
    if (bucket.authAttempts >= this.options.authThreshold || bucket.sensitiveHits >= this.options.sensitiveThreshold) {
      bucket.elevatedUntil = now + this.options.windowMs * 5;
    }
  }

  snapshotCount(ip: string): number {
    const bucket = this.buckets.get(ipKey(ip));
    if (!bucket) return 0;
    if (Date.now() - bucket.windowStart >= this.options.windowMs) return 0;
    return bucket.count;
  }

  snapshotAuth(ip: string): number {
    const bucket = this.buckets.get(ipKey(ip));
    if (!bucket) return 0;
    if (Date.now() - bucket.windowStart >= this.options.windowMs) return 0;
    return bucket.authAttempts;
  }

  snapshotSensitive(ip: string): number {
    const bucket = this.buckets.get(ipKey(ip));
    if (!bucket) return 0;
    if (Date.now() - bucket.windowStart >= this.options.windowMs) return 0;
    return bucket.sensitiveHits;
  }

  reset(): void {
    this.buckets.clear();
  }
}

export const rateLimiter = new RateLimiter();
