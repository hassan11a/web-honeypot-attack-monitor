import Link from "next/link";
import { CategoryBadge, EmptyState, Panel, SeverityBadge } from "@/components/ui";
import { getIpActivity, getIpTopPaths, listLoginEvents, listSecurityEvents } from "@/database/repositories";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function IpDetailPage({
  params,
}: {
  params: Promise<{ ip: string }>;
}) {
  const { ip: raw } = await params;
  const ip = decodeURIComponent(raw);
  const [activity, paths, events, logins] = await Promise.all([
    getIpActivity(ip),
    getIpTopPaths(ip, 10),
    listSecurityEvents({ ip, limit: 50 }),
    listLoginEvents(30, ip),
  ]);

  if (!activity && events.length === 0) notFound();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/ips" className="text-xs text-[var(--muted)] hover:underline">
            ← Back to IP activity
          </Link>
          <h1 className="mt-1 font-mono text-xl font-semibold">{ip}</h1>
          <p className="text-sm text-[var(--muted)]">
            Observed status: <strong>{activity?.monitoring_level ?? "Normal"}</strong> — based on activity volume and
            detection hits, not a definitive threat verdict.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Panel title="Total requests"><div className="text-2xl font-semibold tabular-nums">{activity?.total_requests ?? events.length}</div></Panel>
        <Panel title="Suspicious requests"><div className="text-2xl font-semibold tabular-nums text-amber-600">{activity?.suspicious_requests ?? 0}</div></Panel>
        <Panel title="Auth attempts"><div className="text-2xl font-semibold tabular-nums">{activity?.auth_attempts ?? logins.length}</div></Panel>
        <Panel title="First / last seen">
          <div className="text-xs leading-relaxed text-[var(--muted)]">
            <div>{activity?.first_seen.slice(0, 19).replace("T", " ") ?? "—"}</div>
            <div>{activity?.last_seen.slice(0, 19).replace("T", " ") ?? "—"}</div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Most requested paths">
          {paths.length === 0 ? (
            <EmptyState title="No path data" />
          ) : (
            <ul className="space-y-2 text-sm">
              {paths.map((p) => (
                <li key={p.path} className="flex justify-between gap-3 font-mono text-xs">
                  <span className="truncate">{p.path}</span>
                  <span className="tabular-nums text-[var(--muted)]">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="User agent">
          <p className="break-all font-mono text-xs">{activity?.top_user_agent ?? events[0]?.user_agent ?? "—"}</p>
        </Panel>
      </div>

      <Panel title="Recent events">
        {events.length === 0 ? (
          <EmptyState title="No events" />
        ) : (
          <div className="divide-y divide-[var(--card-border)]">
            {events.map((e) => (
              <Link key={e.id} href={`/events?event=${e.id}`} className="flex items-center gap-3 py-2 text-xs hover:bg-[var(--background)]">
                <span className="font-mono text-[var(--muted)]">{e.timestamp.slice(11, 19)}</span>
                <CategoryBadge category={e.category} />
                <span className="truncate font-mono">{e.path}</span>
                <span className="ml-auto"><SeverityBadge severity={e.severity} /></span>
              </Link>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Authentication attempts">
        {logins.length === 0 ? (
          <EmptyState title="No login attempts from this IP" />
        ) : (
          <div className="divide-y divide-[var(--card-border)] text-xs">
            {logins.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center gap-3 py-2">
                <span className="font-mono text-[var(--muted)]">{l.timestamp.slice(11, 19)}</span>
                <span className="font-mono">{l.username || "(empty)"}</span>
                <span className="rounded bg-[var(--background)] px-1.5 py-0.5">{l.result}</span>
                <span className="font-mono text-[var(--muted)]">{l.path}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
