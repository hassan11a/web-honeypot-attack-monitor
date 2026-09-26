import { EventsClient } from "./EventsClient";
import { countSecurityEvents, listAlerts, listSecurityEvents } from "@/database/repositories";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const [events, total, alerts] = await Promise.all([
    listSecurityEvents({ limit: 100 }),
    countSecurityEvents(),
    listAlerts(10, true),
  ]);

  return <EventsClient initialEvents={events} initialTotal={total} initialAlerts={alerts} />;
}
