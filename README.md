🛡️ Sentinel

Web Honeypot & Attack Monitoring Platform

<p align="center">
  <strong>🕵️ Detect • 🧠 Classify • 📊 Monitor • 🔐 Defend</strong>
</p>

<p align="center">
  A defensive cybersecurity honeypot built for security learning, SOC practice,
  threat monitoring, detection engineering, and authorized laboratory environments.
</p>

<p align="center">








</p>

<p align="center">






</p>

⚡ What is Sentinel?

Sentinel is a deliberately fake e-commerce website designed to behave like an attractive target while safely monitoring suspicious HTTP activity.

The project consists of two connected services:

┌──────────────────────────────────────────────────────────┐
│                       SENTINEL                           │
├──────────────────────────────┬───────────────────────────┤
│                              │                           │
│  🛒 BrightCart Honeypot      │  🛡️ SOC Dashboard        │
│  Express + TypeScript        │  Next.js + React         │
│                              │                           │
│  • Fake store                │  • Live monitoring        │
│  • Fake login traps          │  • Security events        │
│  • Request capture           │  • Alerts                 │
│  • Detection engine          │  • IP intelligence        │
│  • Rate limiting             │  • Reports                │
│                              │  • Detection rules        │
└──────────────┬───────────────┴──────────────┬────────────┘
               │                              │
               └──────────────┬───────────────┘
                              ▼
                     🗄️ Shared Database
                    SQLite / PostgreSQL

🎯 Designed for

Cybersecurity students

SOC analysts in training

Blue-team practice

Detection engineering

Security monitoring

Honeypot experimentation

Defensive security research

Authorized security laboratories

Portfolio / cybersecurity projects

🚨 Safety First

Sentinel is defensive by design.

Sentinel does not:

❌ Execute attacker-controlled payloads

❌ Exploit vulnerabilities

❌ Collect real credentials

❌ Store plaintext passwords

❌ Scan third-party systems

❌ Attack or retaliate against sources

❌ Perform DDoS attacks

❌ Deploy malware

❌ Provide persistence

❌ Perform counter-scanning

All attacker-controlled input is treated as inert text.

For fake login traps, Sentinel records only:

username
login result
password_submitted
password length bucket

Example:

password_indicator = len:8-11

The actual password is never stored.

✨ Features

🕵️ Web Honeypot

A complete fake e-commerce experience called BrightCart Commerce.

Includes:

🏠 Homepage

🛍️ Product catalog

🔎 Search

🔐 Customer login trap

🧑‍💻 Fake admin console

📊 Fake dashboard

📡 Decorative API page

📬 Contact form

⭐ Reviews

📦 Fake products

🚨 Branded 404 page

📡 Request Monitoring

Sentinel monitors incoming HTTP traffic and records useful security telemetry:

Data

Description

Timestamp

When the request occurred

Method

GET, POST, TRACE, etc.

Path

Requested endpoint

Query

Sanitized query string

IP

Client IP

User-Agent

Client/browser/tool identity

Referer

Request origin

Status

HTTP response code

Size

Response/request information

Response time

Request duration

Headers

Sanitized headers

Body

Safe body summary

Detection

Matching security indicators

🧠 Detection Engine

Sentinel includes 10 independent detectors.

Each detector can be enabled or disabled at runtime.

Detection modules

Detector

Detects

admin-path

Admin / console path discovery

backup-file

.env, .git, .bak, config files

traversal

Path traversal indicators

injection

SQLi / XSS / command / JNDI-style patterns

scanner-user-agent

sqlmap, nikto, gobuster, zgrab, masscan, etc.

unexpected-method

PUT / DELETE / TRACE / PATCH

auth-probe

Suspicious login activity

frequency

High request volume

recon-path

Reconnaissance paths

suspicious-query

Suspicious query parameters

Detection output follows:

{
  category: string;
  severity: "Info" | "Low" | "Medium" | "High" | "Critical";
  detected: boolean;
  reason: string;
  confidence: number;
}

🧩 Detection philosophy

Sentinel intentionally uses cautious language:

Possible suspicious activity

rather than claiming:

Attack succeeded

A pattern match alone does not prove exploitation.

🚦 Monitoring & Alerts

Sentinel can generate alerts for:

🔐 Authentication bursts

🤖 Scanner activity

📈 Request-volume spikes

🚨 High-risk patterns

🔎 Sensitive path discovery

Alerts use a deduplication window to avoid flooding the dashboard.

📊 SOC Dashboard

The dashboard provides a security-monitoring console for the honeypot.

Dashboard includes

📈 Overview KPIs

📊 Charts

🔴 Live event feed

🚨 Alerts

🌐 IP activity

🔐 Authentication attempts

🧠 Detection rules

📋 Event details

⚙️ Runtime settings

📑 Security reports

Live monitoring

Sentinel uses Server-Sent Events (SSE) for live event updates:

Honeypot
   │
   ▼
Detection Engine
   │
   ▼
Database
   │
   ▼
SSE Stream
   │
   ▼
SOC Dashboard
   │
   └── 🔴 Live Events

🏗️ Architecture

                    Internet / Test Network
                              │
                              ▼
                   ┌────────────────────┐
                   │   Reverse Proxy    │
                   │       nginx        │
                   └─────────┬──────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌───────────────┐        ┌─────────────────┐
        │  Web Honeypot │        │  SOC Dashboard  │
        │ Express + TS  │        │ Next.js + React │
        │    :8080      │        │      :3000      │
        └───────┬───────┘        └────────┬────────┘
                │                         │
                ▼                         │
        ┌────────────────┐                │
        │   Detection    │                │
        │     Engine     │                │
        │  10 Detectors  │                │
        └───────┬────────┘                │
                │                         │
                ▼                         │
        ┌────────────────────────────┐    │
        │       Event Database       │◄───┘
        │ SQLite / PostgreSQL-ready  │
        └────────────────────────────┘

🧰 Tech Stack

Layer

Technology

Honeypot

Node.js 20+, Express 5

Language

TypeScript

Dashboard

Next.js 16

Frontend

React 19

Styling

Tailwind CSS v4

Charts

Recharts

Database

SQLite

Optional DB

PostgreSQL

Validation

Zod

Authentication

Node.js scrypt

Sessions

HttpOnly cookies

Testing

Vitest + Supertest

Linting

ESLint 9

Reverse Proxy

nginx

Containers

Docker + Docker Compose

Live Events

Server-Sent Events

📁 Project Structure

web-honeypot/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── login/
│   ├── setup/
│   │
│   ├── (soc)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── events/
│   │   ├── ips/
│   │   ├── authentication/
│   │   ├── rules/
│   │   ├── reports/
│   │   └── settings/
│   │
│   └── api/
│       ├── auth/
│       ├── stats/
│       ├── events/
│       ├── ips/
│       ├── logins/
│       ├── alerts/
│       ├── rules/
│       ├── settings/
│       ├── reports/
│       └── setup/
│
├── components/
│   ├── Sidebar.tsx
│   ├── TopBar.tsx
│   ├── LiveFeed.tsx
│   ├── EventDetail.tsx
│   ├── charts.tsx
│   └── ui.tsx
│
├── honeypot/
│   ├── server.ts
│   ├── handlers/
│   ├── detection/
│   │   └── detectors/
│   ├── rate-limit/
│   ├── request-monitor/
│   └── alerts/
│
├── database/
│   ├── client.ts
│   ├── sqlite.ts
│   ├── postgres.ts
│   ├── schema.ts
│   └── repositories.ts
│
├── lib/
│   ├── config.ts
│   ├── auth.ts
│   ├── api-auth.ts
│   ├── password.ts
│   ├── redact.ts
│   ├── settings.ts
│   ├── logger.ts
│   └── ip.ts
│
├── reports/
│   └── build.ts
│
├── scripts/
│   └── generate-test-data.ts
│
├── tests/
│
├── docker/
│   ├── Dockerfile.honeypot
│   ├── Dockerfile.dashboard
│   └── nginx.conf
│
├── data/
├── public/
├── types/
├── proxy.ts
├── .env.example
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── postcss.config.mjs
└── README.md

🚀 Quick Start

Requirements

Before starting, install:

Node.js 20+

npm 10+

Git

Docker + Docker Compose (optional)

PostgreSQL 16 (optional)

1️⃣ Clone the Repository

git clone <your-repo-url>.git
cd web-honeypot

2️⃣ Configure Environment

cp .env.example .env

Windows PowerShell

Copy-Item .env.example .env

Then configure:

DASHBOARD_USER=admin
DASHBOARD_PASSWORD=your-strong-password

3️⃣ Install Dependencies

npm install

4️⃣ Start Sentinel

Run both services:

npm run dev

You should see:

🕵️ Honeypot   → http://localhost:8080
🛡️ Dashboard  → http://localhost:3000

🌐 Local URLs

Service

URL

🛒 BrightCart Honeypot

http://localhost:8080

🛡️ SOC Dashboard

http://localhost:3000

🧪 Generate Test Events

You can safely generate sample security events against your local Sentinel honeypot.

Sensitive path

curl http://localhost:8080/.env

XSS-looking query

curl "http://localhost:8080/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E"

Scanner user-agent

curl -A "sqlmap/1.7.2" http://localhost:8080/admin/login

Unexpected HTTP method

curl -X TRACE http://localhost:8080/

Fake login

curl -X POST http://localhost:8080/login \
  -d "username=admin&password=Secret123!" \
  -H "Content-Type: application/x-www-form-urlencoded"

⚠️ These examples are intended for your own local honeypot or an explicitly authorized lab environment.

Open the dashboard and watch the events appear in real time.

📡 Run Services Separately

Honeypot

npm run dev:honeypot

Dashboard

npm run dev:web

🔐 Dashboard Authentication

Default development configuration:

Username:
admin

Password:

Defined by DASHBOARD_PASSWORD

Sessions use:

scrypt password hashing

HttpOnly cookies

database-backed sessions

configurable session TTL

login rate limiting

There are no hard-coded production credentials.

🧪 Testing

Run the complete test suite:

npm test

Watch mode:

npm run test:watch

Type checking:

npm run typecheck

Linting:

npm run lint

Current project test coverage includes:

✓ Honeypot behavior
✓ Authentication
✓ Database
✓ Detection engine
✓ Rate limiting
✓ Validation

41 automated tests are included in the project.

🐳 Docker

Docker Compose is recommended for isolated security labs.

Start

docker compose up --build -d

Check containers

docker compose ps

View logs

docker compose logs -f

Open

http://localhost:8080/

SOC Dashboard:

http://localhost:8080/soc/

Stop

docker compose down

Stop + remove volumes

docker compose down -v

Removing volumes destroys stored database data.

🗄️ PostgreSQL

SQLite is the default database.

To use PostgreSQL:

DB_CLIENT=postgres
DATABASE_URL=postgresql://honeypot:honeypot@postgres:5432/honeypot
POSTGRES_PASSWORD=honeypot

Then:

docker compose --profile postgres up --build -d

🔒 Docker Hardening

The Docker configuration includes security-focused controls such as:

Non-root containers

Read-only filesystem

cap_drop: ALL

no-new-privileges

Resource limits

Internal Docker network

Separate edge network

Restricted service exposure

Architecture:

                 🌐 Internet
                     │
                     ▼
                ┌─────────┐
                │  nginx  │
                └────┬────┘
                     │
               hp_edge network
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   Honeypot                  Dashboard
        │                         │
        └────────────┬────────────┘
                     ▼
             hp_internal network
                     │
                     ▼
              SQLite / Postgres

🧱 Isolation Checklist

For serious or multi-host labs:

Use a dedicated host / VM / isolated VLAN

Never mount host SSH keys

Never mount real application secrets

Prevent access to internal corporate services

Put TLS in front of nginx

Enable SECURE_COOKIES=1

Use TRUST_PROXY=1 behind a trusted proxy

Expose only the required edge port

Never expose PostgreSQL publicly

Never expose the dashboard database directly

Regularly rebuild container images

Consider off-box log retention

🗃️ Data Model

Table

Purpose

security_events

Request metadata + detection results

login_events

Fake authentication attempts

scan_sessions

Per-IP activity windows

ip_activity

IP activity aggregation

alerts

Security alerts

settings

Runtime configuration

detector_state

Detector enable/disable state

dashboard_users

Console accounts

dashboard_sessions

Session token hashes

🔐 Sensitive data protection

❌ Plaintext passwords
        ↓
      NEVER
        ↓
     Stored

Instead:

Submitted password
        │
        ▼
password_submitted = true
        │
        ▼
length bucket
        │
        ▼
len:8-11

🖥️ Dashboard Pages

Route

Purpose

/login

Console authentication

/setup

First-run setup

/dashboard

KPIs, charts and alerts

/events

Security event explorer

/ips

IP activity

/ips/[ip]

IP investigation

/authentication

Fake login attempts

/rules

Detection rule controls

/reports

Security report exports

/settings

Runtime configuration

🔌 HTTP API

Base URL:

http://localhost:3000

Docker:

http://localhost:8080/soc

Method

Endpoint

Description

POST

/api/auth/login

Authenticate

POST

/api/auth/logout

Logout

GET

/api/auth/session

Current session

GET

/api/stats

Dashboard statistics

GET

/api/events

Event listing

GET

/api/events/:id

Event details

GET

/api/events/stream

Live SSE events

GET

/api/ips

IP activity

GET

/api/ips/:ip

IP details

GET

/api/logins

Authentication events

GET

/api/alerts

Recent alerts

GET/PUT

/api/rules

Detection rules

GET/PUT

/api/settings

Runtime settings

GET

/api/reports

JSON / CSV / HTML reports

POST

/api/setup

First-run setup

Unauthenticated protected requests return:

401 Unauthorized

🛒 BrightCart Honeypot Routes

Route

Purpose

/

Fake store homepage

/products

Product catalog

/search?q=

Search

/login

Customer login trap

/admin

Fake admin console

/admin/login

Admin login trap

/dashboard

Fake customer dashboard

/api

Decorative API page

/contact

Contact form

*

Branded 404

Every request flows through:

Rate Limit
     ↓
Capture + Redaction
     ↓
Detection Engine
     ↓
Database
     ↓
Alert Engine

⚙️ Configuration

Application

NODE_ENV=development
LOG_LEVEL=info

Database

DB_CLIENT=sqlite
SQLITE_FILE=./data/honeypot.db
DATABASE_URL=

Honeypot

HONEYPOT_PORT=8080
TRUST_PROXY=1
MAX_REQUEST_BODY_BYTES=65536
MAX_QUERY_LENGTH=2048
REQUEST_TIMEOUT_MS=15000

Dashboard

PORT=3000
NEXT_PUBLIC_BASE_PATH=
DASHBOARD_USER=admin
DASHBOARD_PASSWORD=
SESSION_COOKIE_NAME=hp_session
SESSION_TTL_HOURS=12
SECURE_COOKIES=0

Rate Limiting

RATE_LIMIT_MAX_REQUESTS=120
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_DELAY_MS=0

Alert Thresholds

AUTH_ATTEMPT_THRESHOLD=5
SENSITIVE_PATH_THRESHOLD=10
REQUESTS_PER_MINUTE_ALERT=300
SCANNER_WINDOW_MINUTES=10

📜 npm Scripts

Command

Description

npm run dev

Start honeypot + dashboard

npm run dev:honeypot

Start honeypot only

npm run dev:web

Start dashboard only

npm run build

Build dashboard

npm start

Start production dashboard

npm run start:honeypot

Start honeypot

npm test

Run all tests

npm run test:watch

Test watch mode

npm run lint

Run ESLint

npm run typecheck

TypeScript checking

npm run testdata

Generate development data

🧪 Production Build

Build the dashboard:

npm run build

Start:

npm start

Start honeypot separately:

npm run start:honeypot

Recommended production environment:

NODE_ENV=production
DASHBOARD_PASSWORD=<strong-random-password>
SECURE_COOKIES=1
TRUST_PROXY=1

🛠️ Troubleshooting

Port already in use

EADDRINUSE

Change:

HONEYPOT_PORT=8080
PORT=3000

or stop the process using the port.

Dashboard returns 401

Check:

You are logged in

Session has not expired

DASHBOARD_PASSWORD is configured

Dashboard is running

No events appearing

Check:

curl http://localhost:8080/

Then verify both services are running.

SQLite locked

Avoid running multiple heavy writers at the same time, especially during test-data generation.

Docker logs

docker compose logs -f nginx
docker compose logs -f honeypot
docker compose logs -f dashboard

🚫 Explicit Non-Features

Sentinel intentionally does not provide:

❌ Malware collection
❌ Malware distribution
❌ Exploit execution
❌ RCE
❌ Reverse shells
❌ Persistence
❌ Credential stuffing
❌ DDoS tooling
❌ Load-abuse tooling
❌ Counter-scanning
❌ Automatic retaliation
❌ External port scanning
❌ Plaintext password storage

These restrictions are part of the project's defensive design.

🎓 Learning Goals

Sentinel can be used to practice:

Blue Team

HTTP monitoring

Event analysis

Alert triage

IP investigation

Detection rules

Log analysis

SOC

Live event monitoring

Incident-style investigation

Alert correlation

Authentication monitoring

Security reporting

Detection Engineering

Pattern-based detection

Severity classification

Confidence scoring

Runtime detector controls

Rate-based detection

Secure Development

Authentication

Session management

Input validation

Data redaction

Secure Docker configuration

Database design

🔭 Project Highlights

🛡️ Defensive Honeypot
        +
🧠 Detection Engine
        +
📡 Live Monitoring
        +
🚨 Alert System
        +
📊 SOC Dashboard
        +
🗄️ Persistent Event Storage
        +
🐳 Docker Hardening
        +
🧪 Automated Tests
        =
⚡ Sentinel

📈 Sentinel at a Glance

Capability

Status

Web Honeypot

✅

Fake E-commerce UI

✅

Request Monitoring

✅

Detection Engine

✅

10 Detection Modules

✅

Authentication Traps

✅

Rate Limiting

✅

Alerts

✅

Live SSE Feed

✅

SOC Dashboard

✅

IP Monitoring

✅

Reports

✅

SQLite

✅

PostgreSQL

✅

Docker

✅

nginx Reverse Proxy

✅

Automated Tests

✅

Plaintext Password Storage

❌

Exploit Execution

❌

External Scanning

❌

🧭 Responsible Use

Sentinel is intended for:

Authorized security research, education, defensive monitoring, and isolated laboratory environments.

Only deploy and test Sentinel on systems and networks that you own or are explicitly authorized to test.

Misuse against systems you do not control may violate laws, policies, or terms of service in your jurisdiction.

⭐ Why Sentinel?

Because cybersecurity is not only about attacking systems.

It is also about learning how to:

👀 Observe
      ↓
🧠 Understand
      ↓
🔎 Detect
      ↓
🚨 Alert
      ↓
📊 Investigate
      ↓
🛡️ Defend

Sentinel turns suspicious traffic into security telemetry that can be studied safely.

📌 Project Stack

Express 5
TypeScript
Next.js 16
React 19
Tailwind CSS v4
SQLite
PostgreSQL
Recharts
Zod
Vitest
Supertest
nginx
Docker
Docker Compose
SSE

🔐 Security Philosophy

Observe. Don't retaliate.

Detect. Don't exploit.

Learn. Don't harm.

Defend by design.

<p align="center">

🛡️ Sentinel

Web Honeypot • Detection Engine • SOC Dashboard

Built for defensive cybersecurity learning and authorized security research.

</p>

<p align="center">
  <sub>Express Honeypot · Next.js SOC · 10 Detectors · SQLite/PostgreSQL · SSE · Docker · 41 Tests</sub>
</p>
