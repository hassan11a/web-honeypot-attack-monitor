"use client";

import { useEffect, useState } from "react";
import { EmptyState, Panel, SeverityBadge } from "@/components/ui";
import { RECOMMENDATIONS } from "@/reports/build";
import type { ReportData } from "@/reports/build";

export function ReportsClient() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports")
      .then(async (r) => {
        if (!r.ok) throw new Error("failed");
        setReport(await r.json());
      })
      .catch(() => setError("Failed to load report data"));
  }, []);

  if (error) return <div className="text-sm text-red-500">{error}</div>;
  if (!report) return <div className="text-sm text-[var(--muted)]">Loading report…</div>;

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap gap-2">
        <a
          href="/api/reports?format=json"
          className="rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
        >
          Export JSON
        </a>
        <a
          href="/api/reports?format=csv"
          className="rounded-md border border-[var(--card-border)] px-3 py-2 text-xs font-medium"
        >
          Export CSV
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md border border-[var(--card-border)] px-3 py-2 text-xs font-medium"
        >
          Print report
        </button>
        <span className="self-center text-xs text-[var(--muted)]">Generated {new Date(report.generatedAt).toLocaleString()}</span>
      </div>

      <Panel title="Overview">
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div><div className="text-[11px] uppercase text-[var(--muted)]">Total requests</div><div className="text-xl font-semibold tabular-nums">{report.overview.totalRequests}</div></div>
          <div><div className="text-[11px] uppercase text-[var(--muted)]">Suspicious</div><div className="text-xl font-semibold tabular-nums text-amber-600">{report.overview.suspiciousRequests}</div></div>
          <div><div className="text-[11px] uppercase text-[var(--muted)]">Auth attempts</div><div className="text-xl font-semibold tabular-nums">{report.overview.authAttempts}</div></div>
          <div><div className="text-[11px] uppercase text-[var(--muted)]">Unique IPs</div><div className="text-xl font-semibold tabular-nums">{report.overview.uniqueSourceIps}</div></div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Detection summary by category">
          <ul className="space-y-1.5 text-xs">
            {report.categories.map((c) => (
              <li key={c.label} className="flex justify-between"><span>{c.label}</span><span className="font-mono tabular-nums">{c.count}</span></li>
            ))}
          </ul>
        </Panel>
        <Panel title="By severity">
          <ul className="space-y-1.5 text-xs">
            {report.severities.map((c) => (
              <li key={c.label} className="flex justify-between"><span>{c.label}</span><span className="font-mono tabular-nums">{c.count}</span></li>
            ))}
          </ul>
        </Panel>
        <Panel title="Top source IPs">
          <ul className="space-y-1.5 text-xs">
            {report.ips.map((c) => (
              <li key={c.label} className="flex justify-between font-mono"><span className="truncate">{c.label}</span><span className="tabular-nums">{c.count}</span></li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Top requested paths">
          <ul className="space-y-1.5 text-xs font-mono">
            {report.paths.map((c) => (
              <li key={c.label} className="flex justify-between gap-3"><span className="truncate">{c.label}</span><span className="tabular-nums text-[var(--muted)]">{c.count}</span></li>
            ))}
          </ul>
        </Panel>
        <Panel title="Top user agents">
          <ul className="space-y-1.5 text-xs">
            {report.userAgents.map((c) => (
              <li key={c.label} className="flex justify-between gap-3"><span className="truncate font-mono text-[11px]">{c.label || "(empty)"}</span><span className="tabular-nums text-[var(--muted)]">{c.count}</span></li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Event timeline (latest 50)">
        {report.recentEvents.length === 0 ? (
          <EmptyState title="No events" />
        ) : (
          <div className="max-h-80 space-y-1.5 overflow-y-auto text-xs">
            {report.recentEvents.slice(0, 50).map((e) => (
              <div key={e.id} className="flex flex-wrap items-center gap-2 border-b border-[var(--card-border)] pb-1.5">
                <span className="font-mono text-[var(--muted)]">{e.timestamp.slice(11, 19)}</span>
                <SeverityBadge severity={e.severity} />
                <span className="text-[var(--muted)]">{e.category}</span>
                <span className="truncate font-mono">{e.method} {e.path}</span>
                <span className="ml-auto font-mono text-[var(--muted)]">{e.source_ip}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Recommendations">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-[var(--muted)]">
          {RECOMMENDATIONS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-[var(--muted)]">
          Disclaimer: detections are pattern-based indicators for defensive monitoring. They do not confirm that an
          attack succeeded.
        </p>
      </Panel>
    </div>
  );
}
