import { EmptyState, Panel } from "@/components/ui";
import { listLoginEvents } from "@/database/repositories";

export const dynamic = "force-dynamic";

export default async function AuthenticationPage() {
  const logins = await listLoginEvents(200);

  const byResult = logins.reduce<Record<string, number>>((acc, l) => {
    acc[l.result] = (acc[l.result] ?? 0) + 1;
    return acc;
  }, {});

  const byIp = Object.entries(
    logins.reduce<Record<string, number>>((acc, l) => {
      acc[l.source_ip] = (acc[l.source_ip] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Authentication monitoring</h1>
        <p className="text-sm text-[var(--muted)]">
          Fake login traps at /login and /admin/login. Passwords are never stored — only that a password field was
          submitted and a safe length indicator.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Attempts by result">
          <ul className="space-y-2 text-sm">
            {Object.entries(byResult).map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span className="capitalize">{k}</span>
                <span className="font-mono tabular-nums">{v}</span>
              </li>
            ))}
            {logins.length === 0 ? <li className="text-xs text-[var(--muted)]">No attempts yet.</li> : null}
          </ul>
        </Panel>
        <Panel title="Top sources">
          <ul className="space-y-2 text-sm">
            {byIp.map(([ip, count]) => (
              <li key={ip} className="flex justify-between font-mono text-xs">
                <span>{ip}</span>
                <span className="tabular-nums">{count}</span>
              </li>
            ))}
            {byIp.length === 0 ? <li className="text-xs text-[var(--muted)]">No data.</li> : null}
          </ul>
        </Panel>
        <Panel title="Note">
          <p className="text-xs leading-relaxed text-[var(--muted)]">
            These are trap endpoints only. The honeypot never authenticates anyone to a real system and does not
            validate submitted credentials anywhere.
          </p>
        </Panel>
      </div>

      <Panel title="Recent authentication events">
        <div className="overflow-x-auto">
          {logins.length === 0 ? (
            <EmptyState title="No authentication attempts recorded" />
          ) : (
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-left text-[11px] uppercase tracking-wide text-[var(--muted)]">
                  <th className="py-2 pr-4 font-semibold">Time</th>
                  <th className="py-2 pr-4 font-semibold">Source</th>
                  <th className="py-2 pr-4 font-semibold">Username</th>
                  <th className="py-2 pr-4 font-semibold">Result</th>
                  <th className="py-2 pr-4 font-semibold">Path</th>
                  <th className="py-2 pr-4 font-semibold">Password</th>
                  <th className="py-2 font-semibold">User-Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {logins.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2 pr-4 font-mono text-xs text-[var(--muted)]">
                      {l.timestamp.slice(0, 19).replace("T", " ")}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs">{l.source_ip}</td>
                    <td className="max-w-[160px] truncate py-2 pr-4 font-mono text-xs">{l.username || "—"}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                          l.result === "locked"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {l.result}
                      </span>
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs">{l.path}</td>
                    <td className="py-2 pr-4 text-xs text-[var(--muted)]">
                      {l.password_submitted ? `submitted (${l.password_indicator ?? "len:—"})` : "not submitted"}
                    </td>
                    <td className="max-w-[220px] truncate py-2 font-mono text-[11px] text-[var(--muted)]" title={l.user_agent}>
                      {l.user_agent || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Panel>
    </div>
  );
}
