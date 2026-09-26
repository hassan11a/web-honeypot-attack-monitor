"use client";

import { useRouter } from "next/navigation";
import { LiveFeed } from "@/components/LiveFeed";
import { EventDetail } from "@/components/EventDetail";
import { useState } from "react";
import type { AlertRecord, SecurityEvent } from "@/types";

export function EventsClient({
  initialEvents,
  initialAlerts,
  initialTotal,
}: {
  initialEvents: SecurityEvent[];
  initialAlerts: AlertRecord[];
  initialTotal: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState("");
  const router = useRouter();

  function openEvent(id: number) {
    setSelected(id);
    router.replace(`/events?event=${id}`, { scroll: false });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Live events</h1>
          <p className="text-sm text-[var(--muted)]">{initialTotal} events recorded · click a row for details</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter is applied on reload…"
            className="rounded-md border border-[var(--card-border)] bg-transparent px-3 py-1.5 text-xs outline-none"
          />
          <button
            type="button"
            onClick={() => window.open("/api/events?limit=200", "_blank", "noopener")}
            className="rounded-md border border-[var(--card-border)] px-3 py-1.5 text-xs font-medium"
          >
            Export JSON
          </button>
        </div>
      </div>
      <LiveFeed initialEvents={initialEvents} initialAlerts={initialAlerts} onOpenEvent={openEvent} />
      {selected !== null ? <EventDetail id={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}
