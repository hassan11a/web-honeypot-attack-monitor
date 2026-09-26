import { describe, expect, it } from "vitest";
import { normalizeIp, isPrivateIp } from "@/lib/ip";
import { truncate, safeString } from "@/lib/redact";

describe("input validation helpers", () => {
  it("normalizes forwarded IPs", () => {
    expect(normalizeIp("  203.0.113.1 , 10.0.0.1 ")).toBe("203.0.113.1");
    expect(normalizeIp("::ffff:192.0.2.1")).toBe("192.0.2.1");
    expect(normalizeIp("")).toBe("unknown");
    expect(normalizeIp(null)).toBe("unknown");
  });

  it("classifies private ranges", () => {
    expect(isPrivateIp("127.0.0.1")).toBe(true);
    expect(isPrivateIp("10.1.2.3")).toBe(true);
    expect(isPrivateIp("192.168.1.1")).toBe(true);
    expect(isPrivateIp("203.0.113.1")).toBe(false);
  });

  it("truncates oversized values", () => {
    const long = "a".repeat(5000);
    expect(truncate(long, 100).length).toBeLessThanOrEqual(101);
  });

  it("serializes unknown values safely", () => {
    expect(safeString(42)).toBe("42");
    expect(safeString({ a: 1 })).toBe('{"a":1}');
    expect(safeString(null)).toBe("");
  });
});
