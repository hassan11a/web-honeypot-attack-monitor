"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PALETTE = ["#2563eb", "#0891b2", "#d97706", "#dc2626", "#7c3aed", "#059669", "#64748b", "#db2777"];
const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#7f1d1d",
  High: "#dc2626",
  Medium: "#d97706",
  Low: "#2563eb",
  Info: "#64748b",
};

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number | string; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-xs shadow-lg">
      {label ? <div className="mb-1 font-medium">{label}</div> : null}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-[var(--muted)]">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color || PALETTE[i % PALETTE.length] }} />
          {entry.name}: <span className="font-mono text-[var(--foreground)]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function RequestsOverTimeChart({
  data,
}: {
  data: Array<{ bucket: string; count: number; suspicious: number }>;
}) {
  const rows = data.map((d) => ({
    time: d.bucket.slice(11, 16) || d.bucket.slice(0, 10),
    requests: d.count,
    suspicious: d.suspicious,
  }));
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
          <YAxis tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} />
          <Line type="monotone" dataKey="requests" stroke="#2563eb" strokeWidth={2} dot={false} name="Requests" />
          <Line type="monotone" dataKey="suspicious" stroke="#dc2626" strokeWidth={1.5} dot={false} name="Suspicious" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPieChart({ data }: { data: Array<{ label: string; count: number }> }) {
  const rows = data.filter((d) => d.label !== "Normal Traffic" || d.count > 0).slice(0, 8);
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={rows} dataKey="count" nameKey="label" innerRadius={48} outerRadius={80} paddingAngle={2}>
            {rows.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SeverityBarChart({ data }: { data: Array<{ label: string; count: number }> }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
          <YAxis tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(99,102,241,0.08)" }} />
          <Bar dataKey="count" name="Events" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={SEVERITY_COLORS[entry.label] ?? PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MethodsBarChart({ data }: { data: Array<{ label: string; count: number }> }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} allowDecimals={false} />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} width={64} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(99,102,241,0.08)" }} />
          <Bar dataKey="count" name="Requests" fill="#0891b2" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopList({ data, kind }: { data: Array<{ label: string; count: number }>; kind: "path" | "ua" | "ip" }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <ul className="space-y-2.5">
      {data.length === 0 ? (
        <li className="text-xs text-[var(--muted)]">No data yet.</li>
      ) : null}
      {data.map((row) => (
        <li key={row.label} className="text-xs">
          <div className="mb-1 flex items-center justify-between gap-3">
            <span className={`truncate font-mono ${kind === "path" ? "" : "text-[var(--muted)]"}`} title={row.label}>
              {row.label || "(empty)"}
            </span>
            <span className="tabular-nums text-[var(--muted)]">{row.count}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--card-border)]">
            <div
              className="h-full rounded-full bg-blue-500/70"
              style={{ width: `${Math.max(4, Math.round((row.count / max) * 100))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
