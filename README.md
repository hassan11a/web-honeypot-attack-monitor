# Sentinel — Web Honeypot & Attack Monitoring Platform

A **deliberately fake** e-commerce web application (BrightCart Commerce) that attracts, records, and classifies suspicious HTTP traffic for **cybersecurity learning, defensive monitoring, SOC practice, and authorized lab environments**.

The project ships two services that share one database:

1. **Web Honeypot** (Express + TypeScript) — the fake store visitors hit  
2. **SOC Dashboard** (Next.js + React + Tailwind) — authenticated monitoring console  

> ### Safety first
> This is a **defensive** honeypot only. It does **not** harvest real credentials, execute payloads, run exploits, scan other systems, retaliate against sources, or grant access to anything real. All attacker-controlled input is treated as **inert text**. Plaintext passwords are **never stored** (only a submitted-flag + length bucket).

---

## Table of contents

- [Architecture](#architecture)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [How to start — everything](#how-to-start--everything)
  - [1. Local development (both services)](#1-local-development-both-services)
  - [2. Run services separately](#2-run-services-separately)
  - [3. First-time dashboard login](#3-first-time-dashboard-login)
  - [4. Generate fake traffic](#4-generate-fake-traffic)
  - [5. Run tests / lint / typecheck](#5-run-tests--lint--typecheck)
  - [6. Production build (local)](#6-production-build-local)
  - [7. Docker Compose (recommended for labs)](#7-docker-compose-recommended-for-labs)
  - [8. Docker + PostgreSQL](#8-docker--postgresql)
- [Docker services & ports](#docker-services--ports)
- [Isolation & hardening checklist](#isolation--hardening-checklist)
- [Detection engine](#detection-engine)
- [Data model](#data-model)
- [Dashboard pages](#dashboard-pages)
- [HTTP API reference (dashboard)](#http-api-reference-dashboard)
- [Honeypot site routes](#honeypot-site-routes)
- [Configuration reference](#configuration-reference)
- [npm scripts](#npm-scripts)
- [Troubleshooting](#troubleshooting)
- [Explicit non-features](#explicit-non-features)
- [License & responsible use](#license--responsible-use)

---

## Architecture

```
Internet / Test Network
        │
        ▼
┌──────────────────┐
│  Reverse proxy   │  nginx  (docker/nginx.conf)
└────────┬─────────┘
         │  /*            → honeypot container :8080
         │  /soc/*        → dashboard container :3000
         ▼
┌──────────────────┐     ┌────────────────────┐
│  Web honeypot    │────▶│  Detection engine  │  10 modular detectors
│  (Express / TS)  │     │  rate limit + redact│
└──────────────────┘     └─────────┬──────────┘
                                   ▼
                         ┌────────────────────┐
                         │  Event database    │  SQLite (default) / PostgreSQL-ready
                         └─────────┬──────────┘
                                   ▼
                         ┌────────────────────┐
                         │ Security dashboard │  Next.js + React + TS + Tailwind
                         │  (auth required)   │  stats · live feed · alerts · reports
                         └────────────────────┘
```

**Local development (no Docker):**

| Service | URL | Command |
|---------|-----|---------|
| Honeypot (fake store) | http://localhost:8080 | `npm run dev:honeypot` |
| SOC Dashboard | http://localhost:3000 | `npm run dev:web` |
| Both together | both ports | `npm run dev` |

**Docker (single entry port):**

| URL | What |
|-----|------|
| http://localhost:8080/ | Honeypot fake store |
| http://localhost:8080/soc/ | SOC Dashboard |

Both services share one database file (`data/honeypot.db` locally, named volume `hp_data` in Docker). The dashboard always requires authentication; the honeypot exposes **no** admin or real functionality.

---

## Features

| Area | What you get |
|------|----------------|
| **Honeypot site** | Full fake e-commerce UI: announcement bar, sticky header + search, hero, categories, product grid, reviews, newsletter, multi-column footer — plus `/login`, `/admin`, `/admin/login`, `/dashboard`, `/api`, `/products`, `/search`, `/contact`, branded 404 |
| **Request monitoring** | Timestamp, method, path, query, IP, user-agent, referer, status, size, response time, sanitized headers, body summary |
| **Detection engine** | 10 independent, runtime-toggleable detectors (path discovery, traversal, injection patterns, scanners, auth probing, rate/volume, recon, …) |
| **Classification** | Category + severity + confidence; cautious *“possible / suspicious indicator”* language |
| **Fake auth traps** | `/login`, `/admin/login` — store username, result, `password_submitted`, length bucket only (**never plaintext passwords**) |
| **Rate limiting** | Per-IP sliding window, optional delay, HTTP 429 + `Retry-After`, elevated monitoring levels |
| **Alerts** | Auth bursts, scanner activity, volume spikes, high-risk patterns (15 min dedupe) |
| **SOC dashboard** | Overview KPIs + charts, live event feed (SSE), event detail drawer, IP activity, authentication attempts, detection rules toggles, reports, settings |
| **Reports** | JSON export, CSV export, printable HTML report |
| **Console auth** | scrypt password hashing, DB-backed sessions, HttpOnly cookies, login rate limit, reverse-proxy gate |
| **Safety** | Input never executed; IP/header/body redaction; production guard on test-data script |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Honeypot server | Node.js 20+, Express 5, TypeScript, tsx |
| Dashboard | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Charts | Recharts |
| Database | SQLite via `better-sqlite3` (default) · PostgreSQL via `pg` (optional) |
| Validation | Zod |
| Auth | scrypt (`node:crypto`), HttpOnly session cookies |
| Tests | Vitest + Supertest |
| Lint / types | ESLint 9 (`eslint-config-next`), `tsc --noEmit` |
| Reverse proxy | nginx 1.27-alpine |
| Containers | Docker / Docker Compose (non-root, read-only FS, cap_drop ALL) |
| Live updates | Server-Sent Events (`/api/events/stream`) |

---

## Project structure

```text
web-honeypot/
│
├── app/                          # Next.js App Router — SOC console + REST API
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing → redirects to dashboard/login
│   ├── globals.css               # Tailwind + global styles
│   ├── login/page.tsx            # Console sign-in page
│   ├── setup/page.tsx            # First-run setup wizard page
│   │
│   ├── (soc)/                    # Authenticated console (layout = sidebar + topbar)
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx    # Overview: KPIs, charts, recent alerts
│   │   ├── events/
│   │   │   ├── page.tsx
│   │   │   └── EventsClient.tsx  # Filterable event table + drawer
│   │   ├── ips/
│   │   │   ├── page.tsx          # IP activity list
│   │   │   └── [ip]/page.tsx     # Single-IP drill-down
│   │   ├── authentication/page.tsx  # Login-trap attempts
│   │   ├── rules/
│   │   │   ├── page.tsx
│   │   │   └── RulesClient.tsx   # Toggle detectors on/off
│   │   ├── reports/
│   │   │   ├── page.tsx
│   │   │   └── ReportsClient.tsx # Export JSON/CSV/HTML
│   │   └── settings/
│   │       ├── page.tsx
│   │       └── SettingsClient.tsx # Runtime thresholds
│   │
│   └── api/                      # Route handlers (all session-protected except auth)
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── session/route.ts
│       ├── stats/route.ts        # Dashboard KPIs
│       ├── events/
│       │   ├── route.ts          # List + filter
│       │   ├── [id]/route.ts     # Single event
│       │   └── stream/route.ts   # SSE live feed
│       ├── ips/
│       │   ├── route.ts
│       │   └── [ip]/route.ts
│       ├── logins/route.ts       # Fake-auth attempts
│       ├── alerts/route.ts
│       ├── rules/route.ts        # Detector enable/disable
│       ├── settings/route.ts
│       ├── reports/route.ts      # ?format=json|csv|html
│       └── setup/route.ts
│
├── components/                   # Shared React UI
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   ├── LiveFeed.tsx              # SSE / polling live events
│   ├── EventDetail.tsx           # Event drawer
│   ├── charts.tsx                # Recharts wrappers
│   └── ui.tsx                    # Buttons, badges, cards, etc.
│
├── honeypot/                     # Fake-store Express service
│   ├── server.ts                 # Entrypoint (HONEYPOT_PORT, default 8080)
│   ├── handlers/
│   │   ├── app.ts                # Express app, routes, 429, wiring
│   │   ├── pages.ts              # All fake HTML/CSS (BrightCart UI)
│   │   └── pipeline.ts           # recordRequest / recordLoginAttempt + alerts
│   ├── detection/
│   │   ├── engine.ts             # Runs all detectors, merges results
│   │   ├── index.ts
│   │   ├── types.ts
│   │   └── detectors/            # One file per detector (toggleable)
│   │       ├── admin-path.ts
│   │       ├── auth-probe.ts
│   │       ├── backup-file.ts
│   │       ├── frequency.ts
│   │       ├── injection.ts
│   │       ├── recon-path.ts
│   │       ├── scanner-user-agent.ts
│   │       ├── suspicious-query.ts
│   │       ├── traversal.ts
│   │       └── unexpected-method.ts
│   ├── rate-limit/index.ts       # Per-IP sliding window
│   ├── request-monitor/index.ts  # Capture + redaction + detection context
│   └── alerts/index.ts           # Threshold alert helpers
│
├── database/                     # Shared DB layer (SQLite + Postgres dialects)
│   ├── index.ts                  # Public exports
│   ├── client.ts                 # Client factory (DB_CLIENT)
│   ├── sqlite.ts
│   ├── postgres.ts
│   ├── schema.ts                 # CREATE TABLE / migrations
│   └── repositories.ts           # Query helpers used by both services
│
├── lib/                          # Shared utilities (dashboard side)
│   ├── config.ts                 # Env parsing / defaults
│   ├── auth.ts                   # Session create/verify
│   ├── api-auth.ts               # API route guard
│   ├── password.ts               # scrypt hash / verify
│   ├── redact.ts                 # IP / header / body redaction
│   ├── settings.ts               # Runtime settings load/save
│   ├── logger.ts
│   └── ip.ts                     # Client IP extraction
│
├── reports/build.ts              # JSON / CSV / HTML report builders
├── scripts/
│   └── generate-test-data.ts     # Dev-only fake events (refuses production)
│
├── tests/                        # Vitest suites
│   ├── setup helpers (helpers/)
│   ├── auth.test.ts
│   ├── database.test.ts
│   ├── detection.test.ts
│   ├── honeypot.test.ts          # E2E-ish Express + safety tests
│   ├── rate-limit.test.ts
│   └── validation.test.ts
│
├── docker/
│   ├── Dockerfile.honeypot
│   ├── Dockerfile.dashboard
│   └── nginx.conf
│   docker-compose.yml
│
├── data/                         # Local SQLite files (gitignored)
├── public/                       # Next.js static assets
├── types/index.ts                # Shared TypeScript types
│
├── proxy.ts                      # Next.js 16 proxy — auth gate for console routes
├── .env.example                  # Full env template
├── .env                          # Local secrets (gitignored)
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── postcss.config.mjs
├── AGENTS.md
└── README.md
```

---

## Prerequisites

| Requirement | Version / notes |
|-------------|-----------------|
| **Node.js** | **20+** (project verified on v22) |
| **npm** | 10+ (ships with Node 22) |
| **Git** | any recent |
| **Docker + Compose** | optional — only for containerized deploy |
| **PostgreSQL 16** | optional — only if not using SQLite |

Windows, macOS, and Linux all work. Commands below use bash; on PowerShell run the same npm/node commands (avoid `&&` chains in old PowerShell 5.1).

---

## How to start — everything

### 1. Local development (both services)

This is the fastest way to develop and demo.

```bash
# 1) Clone (if from GitHub)
git clone <your-repo-url>.git
cd web-honeypot          # or your folder name, e.g. Honeypot

# 2) Create environment file
cp .env.example .env
# Windows (PowerShell):
# Copy-Item .env.example .env

# 3) Edit .env — at minimum set a strong dashboard password
#    DASHBOARD_PASSWORD=your-long-random-password

# 4) Install dependencies
npm install

# 5) Start BOTH services together (honeypot + dashboard)
npm run dev
```

What `npm run dev` runs (via `concurrently`):

| Label | Command | Port |
|-------|---------|------|
| `hp` | `tsx watch honeypot/server.ts` | **8080** |
| `web` | `next dev` | **3000** |

**Then open:**

| URL | Purpose |
|-----|---------|
| http://localhost:8080 | Fake BrightCart store (honeypot) |
| http://localhost:3000 | SOC dashboard login |

**Quick probe (generate real events):**

```bash
# Sensitive path discovery
curl http://localhost:8080/.env

# XSS-looking search query (stored as text, never executed)
curl "http://localhost:8080/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E"

# Scanner user-agent
curl -A "sqlmap/1.7.2" http://localhost:8080/admin/login

# Unexpected HTTP method
curl -X TRACE http://localhost:8080/

# Fake login (401, password NOT stored in plaintext)
curl -X POST http://localhost:8080/login \
  -d "username=admin&password=Secret123!" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

Within a few seconds, open the dashboard → **Live Events** / **Overview** and watch new rows appear.

**Stop:** `Ctrl+C` in the terminal running `npm run dev`.

---

### 2. Run services separately

Useful when you only need one side.

```bash
# Terminal A — honeypot only (port 8080)
npm run dev:honeypot

# Terminal B — dashboard only (port 3000)
npm run dev:web
```

Production-style single runs (no watch/reload):

```bash
# Honeypot
npm run start:honeypot

# Dashboard (build first — see section 6)
npm run build
npm start
```

---

### 3. First-time dashboard login

1. Open **http://localhost:3000** (or `/soc/` behind Docker).
2. Sign in with credentials from `.env`:

| Variable | Default in `.env.example` |
|----------|---------------------------|
| `DASHBOARD_USER` | `admin` |
| `DASHBOARD_PASSWORD` | you set this in `.env` |

There are **no hard-coded credentials**. Session cookie: `HttpOnly` (`hp_session` by default), TTL from `SESSION_TTL_HOURS` (default 12h).

Unauthenticated API calls return **401**. Console routes are gated by `proxy.ts`.

---

### 4. Generate fake traffic

**A. Manual curl probes** — see section 1 above.

**B. Batch sample data (development only):**

```bash
npm run testdata
```

- Inserts labeled sample events, logins, IP activity, alerts.
- **Refuses to run** when `NODE_ENV=production`.
- Useful for populating charts before a demo.

**C. Point a scanner at it (lab only):**

Only against **this** honeypot on **localhost** or an isolated lab IP you own — never against third-party systems. Examples (authorized lab only): `nmap` HTTP scripts, `nikto -h http://localhost:8080`, or a simple `ab`/`wrk` load — all traffic is logged and redacted.

---

### 5. Run tests / lint / typecheck

```bash
# Full test suite (41 tests)
npm test

# Watch mode during development
npm run test:watch

# TypeScript — must be clean before commit
npm run typecheck

# ESLint
npm run lint
```

| Suite | Covers |
|-------|--------|
| `honeypot.test.ts` | Request logging, sensitive paths, payload-is-inert, login redaction, 404 page |
| `auth.test.ts` | scrypt verify, no plaintext storage, session redaction |
| `database.test.ts` | Schema + repository operations |
| `detection.test.ts` | All detectors, cautious wording, severity merge |
| `rate-limit.test.ts` | Window limits, 429 behavior |
| `validation.test.ts` | Zod / input validation |

---

### 6. Production build (local)

```bash
# Dashboard
npm run build
npm start                 # next start → http://localhost:3000

# Honeypot (separate terminal)
npm run start:honeypot    # tsx honeypot/server.ts → :8080
```

Set production env before starting:

```bash
NODE_ENV=production
DASHBOARD_PASSWORD=<strong-password>
SECURE_COOKIES=1         # if serving behind HTTPS
TRUST_PROXY=1            # if behind nginx / load balancer
```

---

### 7. Docker Compose (recommended for labs)

Single entry point on **port 8080** (nginx routes traffic).

```bash
# 1) Env
cp .env.example .env
# Edit .env → set DASHBOARD_PASSWORD to a strong value (required by compose)

# 2) Build + start all core services detached
docker compose up --build -d

# 3) Check status
docker compose ps
docker compose logs -f
```

| Open | What |
|------|------|
| http://localhost:8080/ | Honeypot fake store |
| http://localhost:8080/soc/ | SOC dashboard login |

**Stop / remove:**

```bash
docker compose down          # stop (keeps DB volume)
docker compose down -v       # stop + delete volumes (destroys data)
```

**Rebuild after code changes:**

```bash
docker compose up --build -d
```

---

### 8. Docker + PostgreSQL

SQLite is the default. To use Postgres instead:

```bash
# .env — switch DB
DB_CLIENT=postgres
DATABASE_URL=postgresql://honeypot:honeypot@postgres:5432/honeypot
POSTGRES_PASSWORD=honeypot

# Start with the postgres profile
docker compose --profile postgres up --build -d
```

Then set the same `DB_CLIENT` + `DATABASE_URL` on the `honeypot` and `dashboard` services (compose file already wires `DB_CLIENT`; add `DATABASE_URL` under `environment` for both if you enable this profile).

---

## Docker services & ports

| Service | Host port | Internal | Notes |
|---------|-----------|----------|-------|
| **nginx** | **8080** → 80 | edge | `/` → honeypot, `/soc/` → dashboard; read-only, no-new-privileges |
| **honeypot** | — | 8080 | `hp_internal` only (not exposed); non-root, read-only FS, `cap_drop: ALL`, 256MB / 0.5 CPU |
| **dashboard** | — | 3000 | `hp_internal` only; `NEXT_PUBLIC_BASE_PATH=/soc`; non-root, read-only, 512MB / 1 CPU |
| **postgres** | — | 5432 | profile `postgres` optional; volume `hp_pgdata` |

**Networks:**

- `hp_edge` — nginx only (faces the world)  
- `hp_internal` — **internal: true** — honeypot + dashboard (+ postgres); no outbound to LAN  

**Volumes:** `hp_data` (SQLite), `hp_pgdata` (Postgres).

---

## Isolation & hardening checklist

The compose file already: internal network, non-root, read-only rootfs, `cap_drop: ALL`, resource limits, `no-new-privileges`.

For production-grade or multi-host labs also:

- [ ] Dedicated host, VM, or isolated VLAN — never a shared corporate LAN  
- [ ] No host credentials, SSH keys, or real app secrets mounted into containers  
- [ ] No routing from honeypot containers to internal corporate services  
- [ ] TLS in front of nginx; set `SECURE_COOKIES=1` and `TRUST_PROXY=1`  
- [ ] Firewall: only expose the edge port (8080/443); never expose 3000/5432  
- [ ] Regular `docker compose pull` + rebuild for base image patches  
- [ ] Off-box log ship (read-only export) if you need forensic retention  
- [ ] Legal notice / banner only if your policy requires it — default UI is intentionally welcoming to attackers  

---

## Detection engine

Each detector lives in `honeypot/detection/detectors/` and is a pure function returning:

```ts
{
  category: string;
  severity: "Info" | "Low" | "Medium" | "High" | "Critical";
  detected: boolean;
  reason: string;       // cautious wording
  confidence: number;   // 0..1
}
```

The **engine** runs all enabled detectors, merges matches (highest severity wins, reasons concatenated), and attaches the result to the stored event. Detectors can be toggled at runtime under **Detection Rules** (persisted in `detector_state`).

| Detector file | Flags |
|---------------|-------|
| `admin-path.ts` | Common admin/console paths (`/wp-admin`, `/phpmyadmin`, …) |
| `backup-file.ts` | `.env`, `.git`, `*.bak`, config dumps |
| `traversal.ts` | `../`, encoded traversal, `/etc/passwd`, … |
| `injection.ts` | SQLi / XSS / cmd / JNDI-style patterns (matched as text only) |
| `scanner-user-agent.ts` | sqlmap, nikto, gobuster, zgrab, masscan, … |
| `unexpected-method.ts` | PUT / DELETE / TRACE / PATCH on public paths |
| `auth-probe.ts` | Repeated or odd login activity |
| `frequency.ts` | High per-IP request volume |
| `recon-path.ts` | `.git`, actuator, `server-status`, swagger, … |
| `suspicious-query.ts` | cmd / file / redirect / debug-style query parameters |

**Language policy:** findings say *possible* or *suspicious indicator*. The system does **not** claim a successful attack unless there is reliable evidence (there never is from patterns alone).

---

## Data model

| Table | Purpose |
|-------|---------|
| `security_events` | Full request metadata: ts, method, path, query, IP, UA, referer, status, size, ms, redacted headers, body summary, detection JSON, scan session id |
| `login_events` | Trap attempts: username, success flag, `password_submitted`, `password_indicator` (e.g. `len:8-11`) — **never plaintext passwords** |
| `scan_sessions` | Per-IP activity windows used by frequency detectors |
| `ip_activity` | Aggregates + monitoring label: `Normal` / `Suspicious` / `High Activity` |
| `alerts` | Threshold alerts: type, severity, reason, dedupe window |
| `settings` | Runtime thresholds (editable in Settings UI) |
| `detector_state` | Per-detector enabled/disabled flags |
| `dashboard_users` | Console users — **scrypt** password hashes only |
| `dashboard_sessions` | Session token **hashes**, expiry, HttpOnly cookie id |

SQLite files live in `data/` locally (gitignored) or volume `hp_data` in Docker.

---

## Dashboard pages

| Route | What it shows |
|-------|----------------|
| `/login` | Console sign-in |
| `/setup` | First-run setup (if used) |
| `/dashboard` | KPI cards, time-series / bar charts, recent alerts |
| `/events` | Filterable event table + detail drawer |
| `/events/[id]` (drawer) | Full redacted event, headers, detection reasons |
| `/ips` | All IPs with counts + monitoring label |
| `/ips/[ip]` | Single-IP timeline and related events |
| `/authentication` | Fake login attempts (username, result, length bucket) |
| `/rules` | Toggle each of the 10 detectors |
| `/reports` | Export JSON / CSV / printable HTML |
| `/settings` | Rate limits, alert thresholds, session TTL, etc. |

---

## HTTP API reference (dashboard)

Base URL: `http://localhost:3000` (dev) or `http://localhost:8080/soc` (Docker).  
All routes below require a valid session cookie unless noted; otherwise **401**.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Sign in → sets `hp_session` |
| `POST` | `/api/auth/logout` | Clear session |
| `GET`  | `/api/auth/session` | Current session info |
| `GET`  | `/api/stats` | Overview KPIs + chart series |
| `GET`  | `/api/events` | List events (`?from`, `?to`, `?severity`, `?category`, `?ip`, `?q`, pagination) |
| `GET`  | `/api/events/:id` | Single event detail |
| `GET`  | `/api/events/stream` | **SSE** live event stream |
| `GET`  | `/api/ips` | IP aggregates |
| `GET`  | `/api/ips/:ip` | Single-IP detail |
| `GET`  | `/api/logins` | Fake-auth attempts |
| `GET`  | `/api/alerts` | Recent alerts |
| `GET`/`PUT` | `/api/rules` | Get / update detector toggles |
| `GET`/`PUT` | `/api/settings` | Get / update runtime settings |
| `GET`  | `/api/reports?format=json\|csv\|html` | Export reports |
| `POST` | `/api/setup` | First-run setup (only when empty) |

---

## Honeypot site routes

Fake **BrightCart Commerce** store — all public, no real backend:

| Route | Page |
|-------|------|
| `/` | Home — hero, categories, featured products, reviews, newsletter |
| `/products` | Product grid with badges / ratings / stock |
| `/search?q=` | Catalog search (server + client filtering) |
| `/login` | Customer sign-in (**trap** → logs attempt, 401) |
| `/admin` | Fake “Partner / Ops” console page |
| `/admin/login` | Admin sign-in (**trap**) |
| `/dashboard` | Fake customer account / orders |
| `/api` | Decorative public “API” page (no real API) |
| `/contact` | Contact form → ticket-style thanks page |
| `*` | Branded **404** page (logged as path discovery) |

Every request passes through: rate limit → capture/redact → detection engine → DB insert → optional alert.

---

## Configuration reference

All secrets and tuning live in environment variables — see [`.env.example`](.env.example). Nothing sensitive is exposed through the dashboard API.

### Application

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | `production` enables strict behavior (blocks testdata) |
| `LOG_LEVEL` | `info` | `debug` \| `info` \| `warn` \| `error` |

### Database

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_CLIENT` | `sqlite` | `sqlite` \| `postgres` |
| `SQLITE_FILE` | `./data/honeypot.db` | SQLite path |
| `DATABASE_URL` | — | Postgres connection string |

### Honeypot

| Variable | Default | Description |
|----------|---------|-------------|
| `HONEYPOT_PORT` | `8080` | Listen port |
| `TRUST_PROXY` | `1` | Trust `X-Forwarded-For` (set `1` behind nginx) |
| `MAX_REQUEST_BODY_BYTES` | `65536` | Body capture cap |
| `MAX_QUERY_LENGTH` | `2048` | Query string cap |
| `REQUEST_TIMEOUT_MS` | `15000` | Handler timeout |

### Dashboard / auth

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Next.js port |
| `NEXT_PUBLIC_BASE_PATH` | — | Set `/soc` in Docker |
| `DASHBOARD_USER` | `admin` | Console username |
| `DASHBOARD_PASSWORD` | — | **Required** — long random value |
| `SESSION_COOKIE_NAME` | `hp_session` | Cookie name |
| `SESSION_TTL_HOURS` | `12` | Session lifetime |
| `SECURE_COOKIES` | `0` | Set `1` behind HTTPS |

### Rate limit / alerts (also in Settings UI)

| Variable | Default | Description |
|----------|---------|-------------|
| `RATE_LIMIT_MAX_REQUESTS` | `120` | Max requests per window per IP |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | Window length |
| `RATE_LIMIT_DELAY_MS` | `0` | Optional artificial delay |
| `AUTH_ATTEMPT_THRESHOLD` | `5` | Login attempts → alert |
| `SENSITIVE_PATH_THRESHOLD` | `10` | Sensitive path hits → alert |
| `REQUESTS_PER_MINUTE_ALERT` | `300` | Volume alert threshold |
| `SCANNER_WINDOW_MINUTES` | `10` | Scanner correlation window |

### Docker Compose Postgres

| Variable | Default |
|----------|---------|
| `POSTGRES_PASSWORD` | `honeypot` |

---

## npm scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Honeypot **+** dashboard together (concurrently) |
| `npm run dev:honeypot` | Honeypot only (tsx watch) |
| `npm run dev:web` | Dashboard only (next dev) |
| `npm run build` | Production Next.js build |
| `npm start` | Start built dashboard |
| `npm run start:honeypot` | Start honeypot (no watch) |
| `npm test` | Vitest full run |
| `npm run test:watch` | Vitest watch |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run testdata` | Insert sample events (dev only) |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `EADDRINUSE` on 8080 / 3000 | Another process has the port — stop it or change `HONEYPOT_PORT` / `PORT` |
| Dashboard 401 on every API call | Not signed in, or session expired — log in again at `/login` |
| Docker: `DASHBOARD_PASSWORD` error | Compose requires it — set it in `.env` before `up` |
| No events appearing | Confirm honeypot is running (`curl http://localhost:8080/`); check `npm run dev` both labels are up |
| SQLite locked / busy | Only one writer expected; avoid running testdata while heavy traffic writes |
| Wrong client IP behind proxy | `TRUST_PROXY=1` and nginx `X-Forwarded-For` (already in compose) |
| Postgres not connecting | `DB_CLIENT=postgres`, valid `DATABASE_URL`, `--profile postgres` up |
| Windows `Start-Process npx` fails | Use `cmd.exe /c npm run dev` or run in a normal terminal |
| Tests fail on import order | Test env is set in `tests/helpers/setup.ts` (setupFiles), not in test bodies |

**Logs:**

```bash
# Docker
docker compose logs -f nginx
docker compose logs -f honeypot
docker compose logs -f dashboard

# Local — foreground is enough with npm run dev
```

---

## Explicit non-features (by design)

This project will **never** include:

- Malware collection or distribution  
- Exploit / RCE / reverse shells  
- Persistence on attacker or victim systems  
- Credential stuffing against third-party services  
- DDoS or load-abuse tooling  
- Automatic retaliation, blocking-by-default as an attack, or counter-scanning  
- Port scanning of external systems  
- Storage of plaintext passwords  

---

## License & responsible use

For **authorized security research and education only**.

You are responsible for deploying this only in environments **you own** or are **explicitly permitted** to test. Misuse against systems you do not control may be illegal in your jurisdiction.

---

**Stack recap:** Express honeypot · Next.js 16 SOC UI · 10-detector engine · SQLite/Postgres · SSE live feed · Docker-hardened · 41 automated tests.
