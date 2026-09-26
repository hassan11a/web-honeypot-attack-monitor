import { detectorCatalog } from "@/honeypot/detection";
import { getDetectorStates } from "@/database/repositories";
import { RulesClient } from "./RulesClient";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const catalog = detectorCatalog();
  const states = await getDetectorStates();
  const detectors = catalog.map((d) => ({
    ...d,
    enabled: states[d.name] ?? d.enabledByDefault,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Detection rules</h1>
        <p className="text-sm text-[var(--muted)]">
          Modular detectors run independently. Disabling a rule stops it from flagging new events only — existing
          events are preserved.
        </p>
      </div>
      <RulesClient detectors={detectors} />
    </div>
  );
}
