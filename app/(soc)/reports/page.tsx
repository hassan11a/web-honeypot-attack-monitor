import { ReportsClient } from "./ReportsClient";

export const dynamic = "force-dynamic";

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Security reports</h1>
        <p className="text-sm text-[var(--muted)]">
          Export machine-readable reports or print a formatted summary for offline review.
        </p>
      </div>
      <ReportsClient />
    </div>
  );
}
