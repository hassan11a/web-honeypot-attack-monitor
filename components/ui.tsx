import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "warn" | "danger" | "ok";
}) {
  const tones = {
    default: "text-[var(--foreground)]",
    warn: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
    ok: "text-emerald-600 dark:text-emerald-400",
  };
  return (
    <div className="card-panel p-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">{label}</div>
      <div className={`mt-1.5 text-2xl font-semibold tabular-nums ${tones[tone]}`}>{value}</div>
      {hint ? <div className="mt-1 text-xs text-[var(--muted)]">{hint}</div> : null}
    </div>
  );
}

export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="card-panel flex flex-col">
      <div className="flex items-center justify-between border-b border-[var(--card-border)] px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      <div className="flex-1 p-4">{children}</div>
    </section>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const cls =
    severity === "Critical"
      ? "sev-critical"
      : severity === "High"
        ? "sev-high"
        : severity === "Medium"
          ? "sev-medium"
          : severity === "Low"
            ? "sev-low"
            : "sev-info";
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}>
      {severity}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const suspicious = !category.includes("Normal");
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${
        suspicious
          ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
          : "border-slate-400/30 bg-slate-400/10 text-[var(--muted)]"
      }`}
    >
      {category}
    </span>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="text-sm font-medium text-[var(--foreground)]">{title}</div>
      {subtitle ? <div className="mt-1 max-w-md text-xs text-[var(--muted)]">{subtitle}</div> : null}
    </div>
  );
}
