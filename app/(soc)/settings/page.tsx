import { loadSettings } from "@/lib/settings";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await loadSettings();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-[var(--muted)]">
          Rate limits and alert thresholds. Changes apply to the honeypot within about a minute (or on restart).
        </p>
      </div>
      <SettingsClient initial={settings} />
    </div>
  );
}
