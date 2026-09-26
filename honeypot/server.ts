import { createHoneypotApp } from "./handlers/app";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { getDb } from "@/database";
import { rateLimiter } from "./rate-limit";
import { getAllSettings } from "@/database/repositories";
import { DEFAULT_SETTINGS } from "@/types";

async function applySettingsToRateLimiter(): Promise<void> {
  try {
    const stored = await getAllSettings();
    const max = Number.parseInt(stored.rateLimitMaxRequests ?? "", 10);
    const windowSec = Number.parseInt(stored.rateLimitWindowSeconds ?? "", 10);
    const delay = Number.parseInt(stored.rateLimitDelayMs ?? "", 10);
    rateLimiter.configure({
      maxRequests: Number.isFinite(max) && max > 0 ? max : DEFAULT_SETTINGS.rateLimitMaxRequests,
      windowMs:
        Number.isFinite(windowSec) && windowSec > 0
          ? windowSec * 1000
          : DEFAULT_SETTINGS.rateLimitWindowSeconds * 1000,
      delayMs: Number.isFinite(delay) && delay >= 0 ? delay : DEFAULT_SETTINGS.rateLimitDelayMs,
      authThreshold: DEFAULT_SETTINGS.authAttemptThreshold,
      sensitiveThreshold: DEFAULT_SETTINGS.sensitivePathThreshold,
    });
  } catch (err) {
    logger.warn("settings.load_failed", { error: err instanceof Error ? err.message : String(err) });
  }
}

async function main(): Promise<void> {
  await getDb();
  await applySettingsToRateLimiter();

  const app = createHoneypotApp();
  const server = app.listen(config.honeypotPort, () => {
    logger.info("honeypot.listening", { port: config.honeypotPort });
  });

  server.requestTimeout = config.requestTimeoutMs;
  server.headersTimeout = Math.min(config.requestTimeoutMs, 10_000);
  server.maxHeadersCount = 100;

  const shutdown = () => {
    logger.info("honeypot.shutdown");
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  setInterval(() => {
    void applySettingsToRateLimiter();
  }, 60_000).unref();
}

main().catch((err) => {
  logger.error("honeypot.start_failed", { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
