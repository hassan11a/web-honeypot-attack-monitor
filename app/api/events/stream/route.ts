import { requireSession } from "@/lib/api-auth";
import { listSecurityEvents } from "@/database/repositories";

export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const signal = request.signal;
  let sinceId = Number(new URL(request.url).searchParams.get("sinceId") ?? 0) || 0;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (events: Awaited<ReturnType<typeof listSecurityEvents>>) => {
        if (events.length === 0) return;
        sinceId = Math.max(sinceId, events[0]!.id);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ events, latestId: sinceId })}\n\n`),
        );
      };
      send(await listSecurityEvents({ limit: 20 }));

      while (!signal.aborted) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (signal.aborted) break;
        try {
          const recent = await listSecurityEvents({ limit: 30 });
          const fresh = recent.filter((e) => e.id > sinceId);
          if (fresh.length > 0) send(fresh);
        } catch {
          // keep stream alive across transient DB errors
        }
      }
      try {
        controller.close();
      } catch {
        // already closed
      }
    },
    cancel() {
      // client disconnected
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
