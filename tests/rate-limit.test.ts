import { describe, expect, it } from "vitest";
import { RateLimiter } from "@/honeypot/rate-limit";

describe("rate limiter", () => {
  it("allows requests under the limit", () => {
    const rl = new RateLimiter({ maxRequests: 5, windowMs: 60_000, delayMs: 0, authThreshold: 3, sensitiveThreshold: 3 });
    for (let i = 0; i < 5; i++) {
      const d = rl.check({ ip: "1.2.3.4" });
      expect(d.allowed).toBe(true);
    }
  });

  it("blocks requests over the limit with retry-after", () => {
    const rl = new RateLimiter({ maxRequests: 3, windowMs: 60_000, delayMs: 100, authThreshold: 3, sensitiveThreshold: 3 });
    for (let i = 0; i < 3; i++) rl.check({ ip: "5.6.7.8" });
    const over = rl.check({ ip: "5.6.7.8" });
    expect(over.allowed).toBe(false);
    expect(over.retryAfterSeconds).toBeGreaterThan(0);
    expect(over.delayMs).toBe(100);
  });

  it("tracks auth attempts separately", () => {
    const rl = new RateLimiter({ maxRequests: 100, windowMs: 60_000, delayMs: 0, authThreshold: 3, sensitiveThreshold: 10 });
    rl.check({ ip: "9.9.9.9", isAuthPath: true });
    rl.check({ ip: "9.9.9.9", isAuthPath: true });
    const d = rl.check({ ip: "9.9.9.9", isAuthPath: true });
    expect(d.authAttemptsInWindow).toBe(3);
    expect(d.elevated).toBe(true);
  });

  it("tracks sensitive path hits", () => {
    const rl = new RateLimiter({ maxRequests: 100, windowMs: 60_000, delayMs: 0, authThreshold: 10, sensitiveThreshold: 2 });
    rl.check({ ip: "7.7.7.7", isSensitivePath: true });
    const d = rl.check({ ip: "7.7.7.7", isSensitivePath: true });
    expect(d.sensitiveHitsInWindow).toBe(2);
    expect(d.elevated).toBe(true);
  });

  it("isolates buckets per IP", () => {
    const rl = new RateLimiter({ maxRequests: 2, windowMs: 60_000, delayMs: 0, authThreshold: 5, sensitiveThreshold: 5 });
    rl.check({ ip: "1.1.1.1" });
    rl.check({ ip: "1.1.1.1" });
    expect(rl.check({ ip: "1.1.1.1" }).allowed).toBe(false);
    expect(rl.check({ ip: "2.2.2.2" }).allowed).toBe(true);
  });
});
