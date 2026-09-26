"use client";

import { useState } from "react";
import type { AppSettings } from "@/types";

const FIELDS: Array<{ key: keyof AppSettings; label: string; hint: string; min: number; max: number }> = [
  { key: "rateLimitMaxRequests", label: "Max requests / window", hint: "Per source IP before HTTP 429", min: 10, max: 100000 },
  { key: "rateLimitWindowSeconds", label: "Rate limit window (seconds)", hint: "Sliding window length", min: 5, max: 3600 },
  { key: "rateLimitDelayMs", label: "Delay over limit (ms)", hint: "Artificial delay for throttled requests (0 = immediate 429)", min: 0, max: 5000 },
  { key: "authAttemptThreshold", label: "Auth attempt alert threshold", hint: "Login attempts before alert + elevated monitoring", min: 2, max: 100 },
  { key: "sensitivePathThreshold", label: "Sensitive path threshold", hint: "Hits on sensitive paths before elevated monitoring", min: 2, max: 1000 },
  { key: "requestsPerMinuteAlert", label: "Volume alert threshold", hint: "Requests in window before rate-limit alert", min: 10, max: 100000 },
  { key: "scannerWindowMinutes", label: "Scanner window (minutes)", hint: "Aggregation window for scanner-like activity", min: 1, max: 1440 },
];

export function SettingsClient({ initial }: { initial: AppSettings }) {
  const [values, setValues] = useState<AppSettings>(initial);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Save failed");
        return;
      }
      setValues(data.settings);
      setMessage("Settings saved.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={save} className="card-panel max-w-2xl space-y-4 p-5">
      {message ? <div className="rounded-md border border-[var(--card-border)] px-3 py-2 text-xs">{message}</div> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <label htmlFor={field.key} className="mb-1 block text-xs font-medium">
              {field.label}
            </label>
            <input
              id={field.key}
              type="number"
              min={field.min}
              max={field.max}
              value={values[field.key]}
              onChange={(e) => setValues((v) => ({ ...v, [field.key]: Number(e.target.value) }))}
              className="w-full rounded-md border border-[var(--card-border)] bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <p className="mt-1 text-[11px] text-[var(--muted)]">{field.hint}</p>
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
      <p className="text-[11px] leading-relaxed text-[var(--muted)]">
        Secrets (database credentials, session keys) are environment-only and never exposed through this interface.
      </p>
    </form>
  );
}
