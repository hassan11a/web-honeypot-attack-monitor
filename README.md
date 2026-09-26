<div align="center">

# 🛡️ SENTINEL

### Web Honeypot & Security Operations Dashboard

**A defensive security monitoring platform for detecting, analyzing, and visualizing suspicious web activity.**

<br>

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Tested-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

<br>

[Overview](#-overview) •
[Features](#-features) •
[Architecture](#-architecture) •
[Installation](#-installation) •
[API](#-api) •
[Security](#-security)

</div>

---

## ✦ Overview

**Sentinel** is a controlled web honeypot and Security Operations Center dashboard built for defensive security monitoring, detection engineering, research, and controlled laboratory environments.

It combines a deliberately fake web application with an authenticated SOC dashboard that transforms suspicious HTTP activity into structured security events.

### The Core Idea

```text
                    ┌──────────────────────┐
                    │   Incoming Request   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Honeypot Server    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Detection Engine     │
                    │ 10 Security Rules    │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
             Security Event          Alert Engine
                    │                     │
                    └──────────┬──────────┘
                               ▼
                    ┌──────────────────────┐
                    │      Database        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    SOC Dashboard     │
                    └──────────────────────┘
```

> **Sentinel is designed for authorized security testing and isolated security laboratories.**

---

# ⚡ Features

<table>
<tr>
<td width="50%">

### 🕸️ Web Honeypot

- Fake e-commerce application
- Suspicious request monitoring
- Sensitive path detection
- Authentication monitoring
- Request metadata collection
- Safe payload handling
- HTTP method monitoring
- Query inspection

</td>
<td width="50%">

### 🔎 Detection Engine

- 10 security detectors
- Severity classification
- Confidence scoring
- Detection reasoning
- Multi-detector correlation
- Highest-severity selection
- Structured security events
- Automated alert generation

</td>
</tr>

<tr>
<td>

### 📊 SOC Dashboard

- Security overview
- Event investigation
- IP activity
- Authentication monitoring
- Alert management
- Detection rules
- Reports
- System settings

</td>
<td>

### ⚡ Live Monitoring

- Server-Sent Events
- Real-time event stream
- Live security activity
- Request telemetry
- Alert updates
- Event investigation

</td>
</tr>
</table>

---

# 🧠 Detection Engine

Sentinel currently contains **10 detection categories**.

| Detector | Purpose |
|---|---|
| 🔐 **Admin Path** | Detects suspicious access to administrative paths |
| 🔑 **Authentication Probe** | Detects suspicious authentication activity |
| 📦 **Backup File** | Detects requests for backup or sensitive files |
| 📈 **Frequency** | Detects unusual request frequency |
| 💉 **Injection** | Detects suspicious injection patterns |
| 🧭 **Recon Path** | Detects reconnaissance-oriented paths |
| 🤖 **Scanner User-Agent** | Detects scanner-style user agents |
| 🔍 **Suspicious Query** | Detects suspicious query parameters |
| 📂 **Traversal** | Detects path traversal patterns |
| ⚠️ **Unexpected Method** | Detects unexpected HTTP methods |

### Detection Result

Every detector produces a structured result:

```ts
{
  category: string;
  severity: "Info" | "Low" | "Medium" | "High" | "Critical";
  detected: boolean;
  reason: string;
  confidence: number;
}
```

### Severity Model

| Level | Description |
|---|---|
| `Info` | Informational activity |
| `Low` | Low-risk suspicious activity |
| `Medium` | Moderate suspicious activity |
| `High` | High-risk activity |
| `Critical` | Critical security detection |

When multiple detectors match a request, Sentinel evaluates the results and records the highest applicable severity.

---

# 🏗️ Architecture

Sentinel consists of two primary applications.

### 01 — Web Honeypot

A deliberately fake web application designed to receive, observe, and record suspicious HTTP activity.

### 02 — SOC Dashboard

An authenticated security interface for investigating events, IP activity, alerts, detections, and reports.

---

## Request Processing Pipeline

```text
HTTP Request
     │
     ▼
┌─────────────────┐
│ Request Capture │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Sanitization    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Detector Engine │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Event Builder   │
└────────┬────────┘
         │
         ├───────────────┐
         ▼               ▼
┌──────────────┐  ┌──────────────┐
│   Database   │  │ Alert Engine │
└──────┬───────┘  └──────┬───────┘
       │                  │
       └────────┬─────────┘
                ▼
       ┌─────────────────┐
       │   SSE Stream    │
       └────────┬────────┘
                │
                ▼
       ┌─────────────────┐
       │  SOC Dashboard  │
       └─────────────────┘
```

---

# 📡 Request Telemetry

Sentinel records structured request metadata including:

| Field | Description |
|---|---|
| Timestamp | Time of request |
| Method | HTTP method |
| Path | Requested route |
| Query | Query parameters |
| IP | Source IP |
| User-Agent | Client identification |
| Referer | Request origin |
| Status | HTTP response status |
| Response Size | Response size |
| Response Time | Processing duration |
| Headers | Sanitized headers |
| Body Summary | Safe request-body summary |
| Detections | Detection results |

Sensitive information is sanitized and redacted where appropriate.

---

# 🚨 Alerting

Sentinel can generate alerts for:

- Authentication bursts
- Scanner activity
- Request-volume spikes
- High-risk detection patterns

Alerts use a **15-minute deduplication window** to reduce repeated alerts for the same activity pattern.

---

# 📺 SOC Dashboard

The dashboard provides dedicated views for security investigation.

| Route | Purpose |
|---|---|
| `/login` | Dashboard authentication |
| `/setup` | Initial configuration |
| `/dashboard` | Security overview |
| `/events` | Security event investigation |
| `/ips` | IP activity overview |
| `/ips/[ip]` | Individual IP investigation |
| `/authentication` | Authentication activity |
| `/rules` | Detection rules |
| `/reports` | Security reports |
| `/settings` | System configuration |

---

# ⚡ Real-Time Event Stream

Sentinel supports **Server-Sent Events (SSE)** for live event monitoring.

```text
New Request
     ↓
Detection
     ↓
Security Event
     ↓
Database
     ↓
SSE
     ↓
Dashboard
     ↓
Live Investigation
```

This allows the SOC interface to receive new events without continuously refreshing the page.

---

# 🗄️ Database

Sentinel supports:

- SQLite
- PostgreSQL

### Core Tables

| Table | Purpose |
|---|---|
| `security_events` | Security event records |
| `login_events` | Authentication activity |
| `scan_sessions` | Scanner/recon sessions |
| `ip_activity` | IP activity tracking |
| `alerts` | Generated security alerts |
| `settings` | Application settings |
| `detector_state` | Detector state |
| `dashboard_users` | Dashboard users |
| `dashboard_sessions` | Dashboard sessions |

---

# 🔐 Authentication Security

Sentinel implements defensive authentication mechanisms including:

- `scrypt` password hashing
- Hashed session identifiers
- HttpOnly cookies
- Configurable session expiration
- Optional secure cookies
- Sensitive-data redaction
- Sanitized security logging

> Plaintext dashboard passwords should never be stored.

---

# 🧰 Technology Stack

| Layer | Technology |
|---|---|
| Runtime | **Node.js 20+** |
| Backend | **Express 5** |
| Language | **TypeScript** |
| Frontend | **Next.js 16** |
| UI | **React 19** |
| Styling | **Tailwind CSS v4** |
| Charts | **Recharts** |
| Database | **SQLite / PostgreSQL** |
| SQLite Driver | **better-sqlite3** |
| PostgreSQL Driver | **pg** |
| Containers | **Docker** |
| Orchestration | **Docker Compose** |
| Reverse Proxy | **nginx** |
| Testing | **Vitest + Supertest** |
| Linting | **ESLint 9** |

---

# 📁 Project Structure

```text
sentinel/
│
├── app/                 # Next.js application
├── components/         # Reusable UI components
├── honeypot/            # Honeypot server
├── database/            # Database layer
├── lib/                 # Shared application logic
├── reports/             # Report generation
├── scripts/             # Utility scripts
├── tests/               # Automated tests
├── docker/              # Docker configuration
├── data/                # Runtime/database data
├── public/              # Static assets
├── types/               # TypeScript definitions
│
├── proxy.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── postcss.config.mjs
├── .env.example
└── README.md
```

---

# 🚀 Installation

## Requirements

- Node.js `20+`
- npm
- Git

For containerized deployment:

- Docker
- Docker Compose

## 1. Clone

```bash
git clone <your-repository-url>
cd sentinel
```

## 2. Create Environment File

### Linux / macOS

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

## 3. Configure Dashboard Credentials

```env
DASHBOARD_USER=admin
DASHBOARD_PASSWORD=your-secure-password
```

## 4. Install Dependencies

```bash
npm install
```

## 5. Start Development

```bash
npm run dev
```

---

# 🌐 Local Services

| Service | URL |
|---|---|
| 🕸️ Honeypot | `http://localhost:8080` |
| 📊 Dashboard | `http://localhost:3000` |

---

# 🧪 Security Testing

The following examples are intended for the **local Sentinel environment**.

### Sensitive Path

```bash
curl http://localhost:8080/.env
```

### Suspicious Search Request

```bash
curl "http://localhost:8080/search?q=<test-payload>"
```

### Scanner User-Agent

```bash
curl -A "sqlmap/1.7.2" http://localhost:8080/admin/login
```

### Unexpected Method

```bash
curl -X TRACE http://localhost:8080/
```

### Fake Login Event

```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

---

# 🧰 Development Test Data

Generate development/demo events with:

```bash
npm run testdata
```

The command refuses to run when:

```env
NODE_ENV=production
```

This helps prevent development data from being inserted into production environments.

---

# 🐳 Docker

Start the complete environment:

```bash
docker compose up --build -d
```

Check services:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Stop services:

```bash
docker compose down
```

Remove containers and volumes:

```bash
docker compose down -v
```

---

# 🧱 Container Architecture

| Service | Purpose | Internal Port |
|---|---|---:|
| `nginx` | Edge reverse proxy | `80` |
| `honeypot` | Honeypot application | `8080` |
| `dashboard` | SOC dashboard | `3000` |
| `postgres` | Optional database | `5432` |

Docker hardening includes:

- Non-root containers
- Read-only root filesystem where applicable
- Dropped capabilities
- `no-new-privileges`
- Resource limits
- Internal networks
- Edge network
- Persistent database volumes

---

# 🐘 PostgreSQL

PostgreSQL can be enabled through the Docker configuration.

Example:

```env
DB_CLIENT=postgres
DATABASE_URL=postgresql://honeypot:honeypot@postgres:5432/honeypot
POSTGRES_PASSWORD=honeypot
```

---

# ⚙️ Configuration

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Application environment |
| `LOG_LEVEL` | Logging level |
| `DB_CLIENT` | Database driver |
| `SQLITE_FILE` | SQLite database path |
| `DATABASE_URL` | PostgreSQL connection |
| `HONEYPOT_PORT` | Honeypot port |
| `TRUST_PROXY` | Proxy trust |
| `MAX_REQUEST_BODY_BYTES` | Request body limit |
| `MAX_QUERY_LENGTH` | Query length limit |
| `REQUEST_TIMEOUT_MS` | Request timeout |
| `PORT` | Dashboard port |
| `DASHBOARD_USER` | Dashboard username |
| `DASHBOARD_PASSWORD` | Dashboard password |
| `SESSION_COOKIE_NAME` | Session cookie |
| `SESSION_TTL_HOURS` | Session lifetime |
| `SECURE_COOKIES` | Secure cookie mode |
| `RATE_LIMIT_MAX_REQUESTS` | Rate-limit threshold |
| `RATE_LIMIT_WINDOW_SECONDS` | Rate-limit window |
| `AUTH_ATTEMPT_THRESHOLD` | Authentication threshold |
| `SENSITIVE_PATH_THRESHOLD` | Sensitive path threshold |
| `REQUESTS_PER_MINUTE_ALERT` | Traffic alert threshold |
| `SCANNER_WINDOW_MINUTES` | Scanner detection window |

---

# 🔌 API

<details>
<summary><strong>Authentication API</strong></summary>

| Method | Endpoint |
|---|---|
| `POST` | `/api/auth/login` |
| `POST` | `/api/auth/logout` |
| `GET` | `/api/auth/session` |

</details>

<details>
<summary><strong>Security Data API</strong></summary>

| Method | Endpoint |
|---|---|
| `GET` | `/api/stats` |
| `GET` | `/api/events` |
| `GET` | `/api/events/:id` |
| `GET` | `/api/events/stream` |
| `GET` | `/api/ips` |
| `GET` | `/api/ips/:ip` |
| `GET` | `/api/logins` |
| `GET` | `/api/alerts` |

</details>

<details>
<summary><strong>Configuration API</strong></summary>

| Method | Endpoint |
|---|---|
| `GET` | `/api/rules` |
| `PUT` | `/api/rules` |
| `GET` | `/api/settings` |
| `PUT` | `/api/settings` |
| `POST` | `/api/setup` |

</details>

<details>
<summary><strong>Reports API</strong></summary>

```text
GET /api/reports?format=json
GET /api/reports?format=csv
GET /api/reports?format=html
```

</details>

---

# 🌐 Honeypot Routes

| Route | Purpose |
|---|---|
| `/` | Main application |
| `/products` | Product page |
| `/search?q=` | Search endpoint |
| `/login` | Authentication endpoint |
| `/admin` | Administrative route |
| `/admin/login` | Administrative login |
| `/dashboard` | Fake dashboard |
| `/api` | API-style endpoint |
| `/contact` | Contact endpoint |
| `*` | Catch-all handling |

---

# 🧪 Testing

Run the complete test suite:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Lint:

```bash
npm run lint
```

Type checking:

```bash
npm run typecheck
```

---

# 📋 Test Coverage

| Area | Coverage |
|---|---|
| Authentication | Session handling, password hashing, redaction |
| Database | Schema and repository operations |
| Detection | Detectors, severity, classification |
| Honeypot | Request logging, sensitive paths, payload handling |
| Rate Limiting | `429` behavior |
| Validation | Zod validation |

---

# 📦 npm Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development environment |
| `npm run dev:honeypot` | Start honeypot |
| `npm run dev:web` | Start dashboard |
| `npm run build` | Build application |
| `npm start` | Start dashboard |
| `npm run start:honeypot` | Start honeypot |
| `npm test` | Run tests |
| `npm run test:watch` | Test watch mode |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |
| `npm run testdata` | Generate development data |

---

# 🔒 Security Hardening

Recommended laboratory practices:

- Run Sentinel on a dedicated host or VM
- Use an isolated network/VLAN
- Do not expose host credentials or SSH keys
- Avoid unnecessary public exposure
- Use TLS for remote deployments
- Enable secure cookies behind HTTPS
- Keep container images patched
- Restrict access to the SOC dashboard
- Use strong dashboard credentials
- Review exported logs before sharing them

---

# 🚫 Explicit Non-Features

Sentinel intentionally does **not** provide:

- Attacker-controlled payload execution
- Plaintext password storage
- External system scanning
- Automated exploitation
- Unauthorized credential collection
- Third-party infrastructure attacks
- Uncontrolled public honeypot deployment

The project focuses on:

**Observation → Detection → Logging → Investigation**

---

# 🎯 Intended Use

Sentinel is intended for:

- Security education
- Detection engineering
- SOC training
- Honeypot research
- HTTP monitoring
- Defensive security testing
- Local security laboratories
- Controlled incident-response exercises

Only deploy Sentinel where you have authorization to monitor the involved systems and traffic.

---

# 🗺️ Roadmap

Potential future development:

- [ ] Expanded detector library
- [ ] Advanced event correlation
- [ ] Enhanced IP investigation
- [ ] More visualization components
- [ ] Additional report formats
- [ ] Improved alert management
- [ ] Extended PostgreSQL capabilities
- [ ] Additional telemetry
- [ ] Expanded automated test coverage

---

# 🤝 Contributing

Contributions should preserve Sentinel's defensive security purpose.

Before submitting changes:

```bash
npm run lint
npm run typecheck
npm test
```

When adding a detector, document:

1. Detection purpose
2. Detection conditions
3. Expected severity
4. False-positive considerations
5. Test coverage

---

# 🛡️ Responsible Use

Sentinel is a defensive security research project.

Use it only in environments where you have explicit authorization to monitor the systems and traffic involved.

Do not use Sentinel to attack, scan, exploit, or collect credentials from systems you do not own or have permission to test.

---

<div align="center">

## 🛡️ SENTINEL

### Observe. Detect. Investigate.

**Defensive security monitoring for controlled environments.**

<br>

Made for security research, detection engineering & SOC learning.

</div>
