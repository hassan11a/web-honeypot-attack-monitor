"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DetectorInfo {
  name: string;
  description: string;
  enabledByDefault: boolean;
  enabled: boolean;
}

export function RulesClient({ detectors }: { detectors: DetectorInfo[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function toggle(name: string, enabled: boolean) {
    setPending(name);
    try {
      await fetch("/api/rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, enabled }),
      });
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {detectors.map((d) => (
        <div key={d.name} className="card-panel flex items-start justify-between gap-4 p-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold">{d.name}</span>
              {d.enabledByDefault ? (
                <span className="rounded border border-[var(--card-border)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
                  default on
                </span>
              ) : null}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">{d.description}</p>
          </div>
          <button
            type="button"
            disabled={pending === d.name}
            onClick={() => toggle(d.name, !d.enabled)}
            className={`relative mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
              d.enabled ? "bg-blue-600" : "bg-slate-400/50"
            }`}
            role="switch"
            aria-checked={d.enabled}
            aria-label={`Toggle ${d.name}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                d.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}
