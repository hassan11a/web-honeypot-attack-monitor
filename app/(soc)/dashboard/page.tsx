import Link from "next/link";
import { CategoryPieChart, MethodsBarChart, RequestsOverTimeChart, SeverityBarChart, TopList } from "@/components/charts";
import { LiveFeed } from "@/components/LiveFeed";
import { EmptyState, Panel, StatCard } from "@/components/ui";
import {
  getGroupCounts,
  getOverviewStats,
  getRequestsOverTime,
  listAlerts,
  listSecurityEvents,
} from "@/database/repositories";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [overview, timeseries, categories, severities, methods, paths, userAgents, ips, recent, alerts] =
    await Promise.all([
      getOverviewStats(),
      getRequestsOverTime(24),
      getGroupCounts("category", 8),
      getGroupCounts("severity", 6),
      getGroupCounts("method", 6),
      getGroupCounts("path", 8),
      getGroupCounts("user_agent", 6),
      getGroupCounts("source_ip", 6),
      listSecurityEvents({ limit: 30 }),
      listAlerts(8),
    ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Security overview</h1>
        <p className="text-sm text-[var(--muted)]">
          Real events from the honeypot request pipeline · generated {new Date().toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Total requests" value={overview.totalRequests.toLocaleString()} />
        <StatCard label="Suspicious" value={overview.suspiciousRequests.toLocaleString()} tone="warn" />
        <StatCard label="Auth attempts" value={overview.authAttempts.toLocaleString()} />
        <StatCard label="Scanner activity" value={overview.scannerActivity.toLocaleString()} tone="warn" />
        <StatCard label="High severity" value={overview.highSeverityEvents.toLocaleString()} tone="danger" />
        <StatCard label="Unique IPs" value={overview.uniqueSourceIps.toLocaleString()} />
        <StatCard label="Requests today" value={overview.requestsToday.toLocaleString()} tone="ok" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Requests over time (24h)" >
          <RequestsOverTimeChart data={timeseries} />
        </Panel>
        <Panel title="Events by category">
          <CategoryPieChart data={categories} />
        </Panel>
        <Panel title="Events by severity">
          <SeverityBarChart data={severities} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="HTTP methods">
          <MethodsBarChart data={methods} />
        </Panel>
        <Panel title="Most requested paths">
          <TopList data={paths} kind="path" />
        </Panel>
        <div className="grid gap-4">
          <Panel title="Top user agents">
            <TopList data={userAgents} kind="ua" />
          </Panel>
          <Panel title="Top source IPs">
            <TopList data={ips} kind="ip" />
          </Panel>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Live event stream</h2>
        <Link href="/events" className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">
          Open full feed →
        </Link>
      </div>
      {recent.length === 0 ? (
        <div className="card-panel">
          <EmptyState
            title="Waiting for honeypot traffic"
            subtitle="Send requests to the honeypot service (default port 8080) to populate this dashboard."
          />
        </div>
      ) : (
        <LiveFeed initialEvents={recent} initialAlerts={alerts} />
      )}
    </div>
  );
}
