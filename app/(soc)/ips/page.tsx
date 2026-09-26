import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { listIpActivity } from "@/database/repositories";
import { MonitoringLevel } from "@/types";

export const dynamic = "force-dynamic";

function levelStyle(level: MonitoringLevel): string {
  if (level === "High Activity") return "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400";
  if (level === "Suspicious") return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
}

export default async function IpActivityPage() {
  const ips = await listIpActivity(200);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">IP activity</h1>
        <p className="text-sm text-[var(--muted)]">
          Labels reflect observed activity patterns only — not a definitive maliciousness verdict.
        </p>
      </div>

      <div className="card-panel overflow-x-auto">
        {ips.length === 0 ? (
          <EmptyState title="No source IPs recorded yet" />
        ) : (
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-[var(--card-border)] text-left text-[11px] uppercase tracking-wide text-[var(--muted)]">
                <th className="px-4 py-2.5 font-semibold">Source IP</th>
                <th className="px-4 py-2.5 font-semibold">Requests</th>
                <th className="px-4 py-2.5 font-semibold">Suspicious</th>
                <th className="px-4 py-2.5 font-semibold">Auth attempts</th>
                <th className="px-4 py-2.5 font-semibold">First seen</th>
                <th className="px-4 py-2.5 font-semibold">Last seen</th>
                <th className="px-4 py-2.5 font-semibold">Top UA</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]">
              {ips.map((row) => (
                <tr key={row.source_ip} className="hover:bg-[var(--background)]">
                  <td className="px-4 py-2.5">
                    <Link href={`/ips/${encodeURIComponent(row.source_ip)}`} className="font-mono text-xs text-blue-600 hover:underline dark:text-blue-400">
                      {row.source_ip}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs tabular-nums">{row.total_requests}</td>
                  <td className="px-4 py-2.5 font-mono text-xs tabular-nums">{row.suspicious_requests}</td>
                  <td className="px-4 py-2.5 font-mono text-xs tabular-nums">{row.auth_attempts}</td>
                  <td className="px-4 py-2.5 text-xs text-[var(--muted)]">{row.first_seen.slice(0, 19).replace("T", " ")}</td>
                  <td className="px-4 py-2.5 text-xs text-[var(--muted)]">{row.last_seen.slice(0, 19).replace("T", " ")}</td>
                  <td className="max-w-[200px] truncate px-4 py-2.5 font-mono text-[11px] text-[var(--muted)]" title={row.top_user_agent ?? ""}>
                    {row.top_user_agent || "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex rounded border px-2 py-0.5 text-[11px] font-medium ${levelStyle(row.monitoring_level)}`}>
                      {row.monitoring_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
