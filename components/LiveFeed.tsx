"use client";

import { useCallback, useEffect, useState } from "react";
import { CategoryBadge, EmptyState, SeverityBadge } from "@/components/ui";
import type { AlertRecord, SecurityEvent } from "@/types";

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour12: false });
  } catch {
    return iso;
  }
}

export function LiveFeed({
  initialEvents,
  initialAlerts,
  onOpenEvent,
}: {
  initialEvents: SecurityEvent[];
  initialAlerts: AlertRecord[];
  onOpenEvent?: (id: number) => void;
}) {
  const [events, setEvents] = useState<SecurityEvent[]>(initialEvents);
  const [alerts, setAlerts] = useState<AlertRecord[]>(initialAlerts);
  const [live, setLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/events?limit=30", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events ?? []);
        setLastUpdate(new Date().toLocaleTimeString([], { hour12: false }));
      }
      const alertRes = await fetch("/api/alerts?active=1&limit=10", { cache: "no-store" });
      if (alertRes.ok) {
        const alertData = await alertRes.json();
        setAlerts(alertData.alerts ?? []);
      }
    } catch {
      // transient network failure; next tick retries
    }
  }, []);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [live, refresh]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <span className={`h-2 w-2 rounded-full ${live ? "animate-pulse bg-emerald-500" : "bg-slate-400"}`} />
          {live ? "Live" : "Paused"} · last update {lastUpdate || "—"}
        </div>
        <button
          type="button"
          onClick={() => setLive((v) => !v)}
          className="rounded-md border border-[var(--card-border)] px-2.5 py-1 text-xs"
        >
          {live ? "Pause" : "Resume"}
        </button>
      </div>

      {alerts.length > 0 ? (
        <div className="card-panel divide-y divide-[var(--card-border)]">
          <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Triggered alerts
          </div>
          {alerts.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-2 px-4 py-2.5 text-sm">
              <SeverityBadge severity={a.severity} />
              <span className="font-medium">{a.title}</span>
              <span className="text-xs text-[var(--muted)]">{formatTime(a.timestamp)}</span>
              <span className="text-xs text-[var(--muted)]">— {a.reason}</span>
              {a.source_ip ? <span className="ml-auto font-mono text-xs text-[var(--muted)]">{a.source_ip}</span> : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="card-panel divide-y divide-[var(--card-border)]">
        <div className="grid grid-cols-[70px_1fr_1fr] gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)] md:grid-cols-[70px_150px_1fr_140px_120px]">
          <span>Time</span>
          <span>Category</span>
          <span>Path</span>
          <span className="hidden md:block">Source</span>
          <span className="hidden md:block">Severity</span>
        </div>
        {events.length === 0 ? (
          <EmptyState
            title="No events recorded yet"
            subtitle="Traffic sent to the honeypot service will appear here automatically."
          />
        ) : (
          events.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => onOpenEvent?.(e.id)}
              className="grid w-full grid-cols-[70px_1fr_1fr] items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-[var(--background)] md:grid-cols-[70px_150px_1fr_140px_120px]"
            >
              <span className="font-mono text-xs text-[var(--muted)]">{formatTime(e.timestamp)}</span>
              <span className="truncate"><CategoryBadge category={e.category} /></span>
              <span className="truncate font-mono text-xs" title={e.path}>
                <span className="mr-1.5 text-[var(--muted)]">{e.method}</span>
                {e.path}
              </span>
              <span className="hidden truncate font-mono text-xs text-[var(--muted)] md:block">{e.source_ip}</span>
              <span className="hidden md:block"><SeverityBadge severity={e.severity} /></span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
