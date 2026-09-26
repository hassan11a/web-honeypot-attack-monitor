import express, { type NextFunction, type Request, type Response } from "express";
import { runDetection } from "@/honeypot/detection";
import {
  buildDetectionContext,
  captureRequest,
  isAuthPath,
  isSensitivePath,
} from "@/honeypot/request-monitor";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { truncate } from "@/lib/redact";
import { recordLoginAttempt, recordRequest } from "./pipeline";
import {
  adminPage,
  apiPage,
  contactPage,
  contactThanksPage,
  dashboardPage,
  homePage,
  loginPage,
  notFoundPage,
  productsPage,
  searchFormPage,
  searchPage,
} from "./pages";
import { rateLimiter, type RateLimitDecision } from "../rate-limit";

interface TrackedRequest extends Request {
  __hp?: {
    captured: ReturnType<typeof captureRequest>;
    decision: RateLimitDecision;
    startedAt: number;
  };
}

export function createHoneypotApp() {
  const app = express();
  app.disable("x-powered-by");
  if (config.trustProxy) app.set("trust proxy", true);

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Server", "nginx");
    next();
  });

  app.use(
    express.urlencoded({
      extended: false,
      limit: config.maxRequestBodyBytes,
    }),
  );
  app.use(
    express.json({
      limit: config.maxRequestBodyBytes,
      type: ["application/json", "application/xml", "text/xml"],
    }),
  );
  app.use(
    express.text({
      limit: config.maxRequestBodyBytes,
      type: ["text/plain", "application/octet-stream"],
    }),
  );

  // 1) Capture + rate limit before generating a response.
  app.use((req: TrackedRequest, res: Response, next: NextFunction) => {
    const captured = captureRequest(req);
    const decision = rateLimiter.check({
      ip: captured.sourceIp,
      isAuthPath: isAuthPath(captured.path),
      isSensitivePath: isSensitivePath(captured.path),
    });
    req.__hp = { captured, decision, startedAt: Date.now() };

    if (!decision.allowed) {
      const detection: import("@/types").EngineDetection = {
        detected: true,
        category: "Rate Limit Violation",
        severity: "Medium",
        reason: `Rate limit exceeded: ${decision.requestCountInWindow} requests inside the monitoring window`,
        confidence: "High",
        matches: [],
      };
      res.status(429).setHeader("Retry-After", String(decision.retryAfterSeconds));
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(
        `<!DOCTYPE html><html><head><title>429 Too Many Requests</title></head><body style="font-family:sans-serif;padding:40px"><h1>429 Too Many Requests</h1><p>Please slow down and try again later.</p></body></html>`,
      );
      void recordRequest(captured, detection, 429, Date.now() - req.__hp.startedAt);
      return;
    }

    if (decision.delayMs > 0) {
      setTimeout(next, decision.delayMs);
      return;
    }
    next();
  });

  // 2) Log every completed response through the detection pipeline.
  app.use((req: TrackedRequest, _res: Response, next: NextFunction) => {
    const res = _res;
    res.on("finish", () => {
      if (!req.__hp) return;
      const { captured, decision, startedAt } = req.__hp;
      void (async () => {
        try {
          const ctx = buildDetectionContext(captured, decision);
          const detection = await runDetection(ctx);
          await recordRequest(captured, detection, res.statusCode, Date.now() - startedAt);
        } catch (err) {
          logger.error("honeypot.pipeline_failed", {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      })();
    });
    next();
  });

  app.get("/", (_req, res) => {
    res.send(homePage());
  });

  app.get("/products", (_req, res) => {
    res.send(productsPage());
  });

  app.get("/search", (req, res) => {
    const q = typeof req.query.q === "string" ? truncate(req.query.q, 200) : "";
    if (!q) {
      res.send(searchFormPage());
      return;
    }
    res.send(searchPage(q, "Results are simulated for demonstration purposes."));
  });

  app.get("/contact", (_req, res) => {
    res.send(contactPage());
  });

  app.post("/contact", (_req, res) => {
    res.send(contactThanksPage());
  });

  app.get("/dashboard", (_req, res) => {
    res.send(dashboardPage());
  });

  app.get("/api", (_req, res) => {
    res.send(apiPage());
  });

  app.get(["/api/v1", "/api/v2"], (req, res) => {
    res.json({
      status: "ok",
      service: "brightcart-api",
      version: req.path.endsWith("v2") ? "2.4.1" : "1.9.0",
      docs: "/api",
      notice: "Demo API surface — no live data.",
    });
  });

  app.get("/login", (_req, res) => {
    res.send(loginPage());
  });

  app.post("/login", async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : undefined;
    await recordLoginAttempt({
      ip: clientIp(req),
      username: truncate(username, 128),
      password,
      userAgent: String(req.headers["user-agent"] ?? ""),
      path: "/login",
    });
    res
      .status(401)
      .send(loginPage({ error: "We could not sign you in with those credentials. Please try again." }));
  });

  app.get(["/admin", "/admin/"], (_req, res) => {
    res.send(adminPage());
  });

  app.get("/admin/login", (_req, res) => {
    res.send(loginPage({ admin: true }));
  });

  app.post("/admin/login", async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : undefined;
    await recordLoginAttempt({
      ip: clientIp(req),
      username: truncate(username, 128),
      password,
      userAgent: String(req.headers["user-agent"] ?? ""),
      path: "/admin/login",
    });
    res
      .status(401)
      .send(loginPage({ admin: true, error: "Invalid credentials. This attempt has been logged." }));
  });

  app.use((req, res) => {
    res.status(404).send(notFoundPage(req.path));
  });
  app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
    void next;
    logger.error("honeypot.error", { error: err.message });
    if (!res.headersSent) {
      res.status(400).json({ error: "Bad request" });
    }
  });

  return app;
}

function clientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) return forwarded.split(",")[0]!.trim();
  return req.socket.remoteAddress ?? "unknown";
}
