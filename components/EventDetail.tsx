"use client";

import { useEffect, useState } from "react";
import { CategoryBadge, SeverityBadge } from "@/components/ui";
import type { SecurityEvent } from "@/types";

function Row({ label, value, mono = true }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-[var(--card-border)] py-2 text-sm last:border-0">
      <dt className="text-xs font-medium text-[var(--muted)]">{label}</dt>
      <dd className={mono ? "break-all font-mono text-xs" : "text-xs"}>{value}</dd>
    </div>
  );
}

function tryJson(value: string | null): React.ReactNode {
  if (!value) return <span className="text-[var(--muted)]">—</span>;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return (
      <pre className="max-h-48 overflow-auto rounded bg-[var(--background)] p-2 text-[11px] leading-relaxed">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
  } catch {
    return value;
  }
}

export function EventDetail({ id, onClose }: { id: number; onClose: () => void }) {
  const [event, setEvent] = useState<SecurityEvent | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/events/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Not found");
        const data = await r.json();
        if (!cancelled) setEvent(data.event);
      })
      .catch(() => {
        if (!cancelled) setError("Event not found");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside
        className="h-full w-full max-w-lg overflow-y-auto border-l border-[var(--card-border)] bg-[var(--card)] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-[var(--muted)]">Event #{id}</div>
            <h2 className="text-lg font-semibold">Event details</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--card-border)] px-2.5 py-1 text-xs"
          >
            Close
          </button>
        </div>

        {error ? <div className="text-sm text-red-500">{error}</div> : null}
        {!event && !error ? <div className="text-sm text-[var(--muted)]">Loading…</div> : null}

        {event ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <CategoryBadge category={event.category} />
              <SeverityBadge severity={event.severity} />
              <span className="rounded border border-[var(--card-border)] px-2 py-0.5 text-[11px] text-[var(--muted)]">
                Confidence: {event.confidence || "—"}
              </span>
              <span className="rounded border border-[var(--card-border)] px-2 py-0.5 text-[11px] text-[var(--muted)]">
                {event.monitoring_level}
              </span>
            </div>

            <div className="card-panel p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Detection
              </div>
              <p className="text-sm leading-relaxed">{event.detection_reason || "—"}</p>
            </div>

            <dl className="card-panel p-3">
              <Row label="Timestamp" value={event.timestamp} />
              <Row label="Source IP" value={event.source_ip} />
              <Row label="Method" value={event.method} />
              <Row label="Path" value={event.path} />
              <Row label="Query params" value={tryJson(event.query_params)} mono={false} />
              <Row label="Status code" value={event.status_code} />
              <Row label="Request size" value={`${event.request_size} bytes`} />
              <Row label="Response time" value={`${event.response_time} ms`} />
              <Row label="Host" value={event.host ?? "—"} />
              <Row label="Content-Type" value={event.content_type ?? "—"} />
              <Row label="User-Agent" value={event.user_agent || "—"} />
              <Row label="Referer" value={event.referer ?? "—"} />
            </dl>

            <div className="card-panel p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Request headers (sanitized)
              </div>
              {tryJson(event.request_headers)}
            </div>

            <div className="card-panel p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Body summary (redacted)
              </div>
              {tryJson(event.body_summary)}
            </div>

            <p className="text-[11px] leading-relaxed text-[var(--muted)]">
              Sensitive values (passwords, cookies, auth headers) are redacted at ingest. Payloads are stored as text
              and never executed.
            </p>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
