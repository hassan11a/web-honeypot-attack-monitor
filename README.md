<div align="center">

🛡️ Sentinel

Web Honeypot & Security Operations Monitoring Platform

<p align="center">
  <strong>Observe suspicious HTTP activity · Detect attack indicators · Analyze events · Practice defensive security</strong>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-security-model">Security</a> •
  <a href="#-api-reference">API</a>
</p>

<br>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js 20+"/>
  <img src="https://img.shields.io/badge/TypeScript-5%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Security-Defensive%20Only-00C853?style=for-the-badge&logo=shield&logoColor=white" alt="Defensive Security"/>
  <img src="https://img.shields.io/badge/Database-SQLite%20%7C%20PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="Database"/>
  <img src="https://img.shields.io/badge/Live%20Monitoring-SSE-8A2BE2?style=for-the-badge" alt="SSE"/>
</p>

</div>

🎯 Overview

Sentinel is a deliberately fake e-commerce application designed as a defensive web honeypot and security monitoring platform.

Instead of protecting a real production application, Sentinel provides a controlled environment where suspicious HTTP activity can be:

🔎 Captured

🧠 Classified

📊 Visualized

🚨 Alerted

📝 Reported

🧪 Studied

The platform combines a fake storefront with an authenticated SOC-style security dashboard, allowing security learners and defenders to observe suspicious traffic in a controlled environment.

Sentinel is designed for cybersecurity education, defensive monitoring, SOC practice, authorized research, and isolated laboratory environments.

⚠️ Safety First

Sentinel is intentionally designed as a defensive-only honeypot.

It does not:

❌ Execute attacker-controlled payloads

❌ Exploit vulnerable systems

❌ Collect real credentials

❌ Store plaintext passwords

❌ Scan third-party infrastructure

❌ Perform credential stuffing

❌ Launch attacks against external systems

❌ Retaliate against suspicious sources

❌ Provide access to real administrative functionality

All attacker-controlled input is treated as inert text.

For fake login traps, Sentinel stores indicators such as:

username
authentication result
password_submitted
password length bucket

It does not store the submitted password itself.

🧩 Core Architecture

Sentinel consists of two primary services sharing a common database.

Service

Purpose

Technology

🛒 Web Honeypot

Fake e-commerce application exposed to test traffic

Express + TypeScript

🖥️ SOC Dashboard

Authenticated security monitoring console

Next.js + React + Tailwind

The platform additionally provides:

Detection engine

Event database

Alerting

Rate limiting

Authentication

SSE live monitoring

Reports

Docker isolation

🏗️ Architecture

                         Internet / Test Network
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │       Reverse Proxy      │
                    │          nginx           │
                    └────────────┬─────────────┘
                                 │
                 ┌───────────────┴────────────────┐
                 │                                │
                 ▼                                ▼
       ┌──────────────────┐             ┌──────────────────┐
       │   Web Honeypot   │             │  SOC Dashboard   │
       │                  │             │                  │
       │ Express + TS     │             │ Next.js + React  │
       │ Fake Store       │             │ Tailwind CSS     │
       └────────┬─────────┘             └────────┬─────────┘
                │                                │
                ▼                                │
       ┌──────────────────┐                      │
       │ Detection Engine │                      │
       │                  │                      │
       │ 10 Detectors     │                      │
       │ Rate Limiting    │                      │
       │ Redaction        │                      │
       └────────┬─────────┘                      │
                │                                │
                └──────────────┬─────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │    Event Database   │
                    │                     │
                    │ SQLite / PostgreSQL │
                    └─────────────────────┘

✨ Features

🕸️ Web Honeypot

A complete fake e-commerce storefront designed to generate realistic application traffic.

Includes:

Announcement bar

Sticky navigation

Search

Hero section

Categories

Product grid

Reviews

Newsletter

Footer

Fake authentication

Fake administration routes

Fake dashboard

Branded 404 page

Trap Routes

/login
/admin
/admin/login
/dashboard
/api
/products
/search
/contact

These routes provide controlled surfaces for observing suspicious requests.

🔍 Request Monitoring

Sentinel records security-relevant request metadata including:

Timestamp
HTTP method
Request path
Query parameters
IP address
User agent
Referer
HTTP status
Response size
Response time
Sanitized headers
Body summary
Detection results

Sensitive information is redacted before storage where applicable.

🧠 Detection Engine

Sentinel uses 10 independent detectors.

Each detector can be enabled or disabled at runtime from the SOC dashboard.

Detection Pipeline

Incoming Request
       │
       ▼
Rate Limiter
       │
       ▼
Request Capture
       │
       ▼
Redaction
       │
       ▼
Detection Engine
       │
       ├── Admin Path
       ├── Authentication Probe
       ├── Backup File
       ├── Frequency
       ├── Injection
       ├── Recon Path
       ├── Scanner User-Agent
       ├── Suspicious Query
       ├── Traversal
       └── Unexpected Method
       │
       ▼
Classification
       │
       ▼
Database
       │
       ├── Alert
       └── Dashboard

🧪 Detection Categories

Detector

Detects

admin-path.ts

Common administrative paths

backup-file.ts

.env, .git, backup/config paths

traversal.ts

Path traversal indicators

injection.ts

SQL/XSS/command/JNDI-style patterns

scanner-user-agent.ts

Known scanner-style user agents

unexpected-method.ts

Unexpected HTTP methods

auth-probe.ts

Repeated or unusual login activity

frequency.ts

High request volume

recon-path.ts

Reconnaissance-oriented paths

suspicious-query.ts

Suspicious query parameters

Detection results are deliberately cautious. Sentinel reports possible or suspicious indicators rather than claiming an attack succeeded merely because a pattern matched.

🚨 Alerting

Sentinel can generate alerts for:

Authentication bursts

Scanner activity

Request-volume spikes

High-risk detection patterns

Sensitive-path activity

Alerts use a 15-minute deduplication window.

📊 SOC Dashboard

The authenticated security dashboard provides a central place to monitor the honeypot.

Dashboard Areas

┌────────────────────────────────────────────────────────┐
│                    SENTINEL SOC                        │
├─────────────┬──────────────────────────────────────────┤
│ Overview    │ KPIs · Charts · Recent Alerts            │
│ Events      │ Filterable Security Events               │
│ IP Activity │ IP statistics + activity labels          │
│ Auth        │ Fake authentication attempts             │
│ Rules       │ Detection rule controls                  │
│ Reports     │ JSON · CSV · HTML exports                │
│ Settings    │ Runtime thresholds                       │
└─────────────┴──────────────────────────────────────────┘

Dashboard Pages

Route

Purpose

/login

Console authentication

/setup

First-run setup

/dashboard

KPIs, charts and alerts

/events

Event monitoring

/ips

IP activity

/ips/[ip]

Individual IP investigation

/authentication

Authentication attempts

/rules

Detection controls

/reports

Report generation

/settings

Runtime configuration

⚡ Live Event Monitoring

Sentinel uses Server-Sent Events (SSE) for live event updates.

Honeypot
   │
   │ New Event
   ▼
Database
   │
   ▼
SSE Stream
   │
   ▼
SOC Dashboard
   │
   ▼
Live Event Feed

This allows security events to appear in the dashboard without requiring a full page refresh.

🗄️ Database

Sentinel supports two database backends.

SQLite

Default configuration:

./data/honeypot.db

PostgreSQL

Optional PostgreSQL support is available through the pg driver.

Data Model

Table

Purpose

security_events

Captured request metadata and detections

login_events

Fake authentication attempts

scan_sessions

Per-IP activity windows

ip_activity

IP activity aggregates

alerts

Generated security alerts

settings

Runtime configuration

detector_state

Detector enable/disable state

dashboard_users

Console users

dashboard_sessions

Session token hashes

Credential Safety

Dashboard passwords use:

scrypt hashing

Session identifiers are stored as hashes, and session cookies use:

HttpOnly

🧰 Tech Stack

Backend

<p>
<img src="https://skillicons.dev/icons?i=nodejs,express,typescript" alt="Backend technologies"/>
</p>

Node.js 20+

Express 5

TypeScript

tsx

Frontend

<p>
<img src="https://skillicons.dev/icons?i=nextjs,react,tailwind" alt="Frontend technologies"/>
</p>

Next.js 16

React 19

TypeScript

Tailwind CSS v4

Recharts

Database

<p>
<img src="https://skillicons.dev/icons?i=sqlite,postgres" alt="Database technologies"/>
</p>

SQLite

PostgreSQL

better-sqlite3

pg

Infrastructure

<p>
<img src="https://skillicons.dev/icons?i=docker,nginx" alt="Infrastructure technologies"/>
</p>

Docker

Docker Compose

nginx

Testing & Quality

Vitest

Supertest

ESLint 9

TypeScript compiler

📁 Project Structure

web-honeypot/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── login/
│   ├── setup/
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
│   │   ├── app.ts
│   │   ├── pages.ts
│   │   └── pipeline.ts
│   │
│   ├── detection/
│   │   ├── engine.ts
│   │   ├── index.ts
│   │   ├── types.ts
│   │   └── detectors/
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
│   │
│   ├── rate-limit/
│   ├── request-monitor/
│   └── alerts/
│
├── database/
│   ├── index.ts
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
│   ├── auth.test.ts
│   ├── database.test.ts
│   ├── detection.test.ts
│   ├── honeypot.test.ts
│   ├── rate-limit.test.ts
│   └── validation.test.ts
│
├── docker/
│   ├── Dockerfile.honeypot
│   ├── Dockerfile.dashboard
│   └── nginx.conf
│
├── data/
├── public/
├── types/
│   └── index.ts
│
├── proxy.ts
├── .env.example
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── postcss.config.mjs
├── AGENTS.md
└── README.md

⚡ Quick Start

Requirements

Requirement

Version

Node.js

20+

npm

10+

Git

Recent version

Docker

Optional

PostgreSQL

16+ optional

1️⃣ Clone the Project

git clone <your-repo-url>.git
cd web-honeypot

2️⃣ Create Environment File

cp .env.example .env

Windows PowerShell

Copy-Item .env.example .env

Set a strong dashboard password in .env:

DASHBOARD_PASSWORD=your-long-random-password

3️⃣ Install Dependencies

npm install

4️⃣ Start Sentinel

npm run dev

This starts both services.

Service

Address

🛒 Honeypot

http://localhost:8080

🖥️ SOC Dashboard

http://localhost:3000

🧪 Generate Test Events

Once Sentinel is running, you can generate controlled test traffic.

Sensitive Path

curl http://localhost:8080/.env

XSS-Looking Query

curl "http://localhost:8080/search?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E"

Scanner User-Agent

curl -A "sqlmap/1.7.2" http://localhost:8080/admin/login

Unexpected HTTP Method

curl -X TRACE http://localhost:8080/

Fake Login Trap

curl -X POST http://localhost:8080/login \
  -d "username=admin&password=Secret123!" \
  -H "Content-Type: application/x-www-form-urlencoded"

The submitted password is not stored in plaintext.

Open the dashboard and navigate to:

Live Events

to observe the resulting events.

🧪 Development Test Data

For development/demo environments:

npm run testdata

This generates labeled sample:

Events

Login attempts

IP activity

Alerts

The script refuses to run when:

NODE_ENV=production

🐳 Docker

Docker Compose provides a hardened lab-oriented deployment.

Start

cp .env.example .env

Set:

DASHBOARD_PASSWORD=your-strong-password

Then:

docker compose up --build -d

Check services:

docker compose ps

View logs:

docker compose logs -f

Docker URLs

URL

Service

http://localhost:8080/

Honeypot

http://localhost:8080/soc/

SOC Dashboard

Stop

docker compose down

Remove volumes:

docker compose down -v

Removing volumes destroys stored database data.

🐘 PostgreSQL

SQLite is the default database.

To use PostgreSQL:

DB_CLIENT=postgres
DATABASE_URL=postgresql://honeypot:honeypot@postgres:5432/honeypot
POSTGRES_PASSWORD=honeypot

Start the PostgreSQL profile:

docker compose --profile postgres up --build -d

🔌 Docker Services

Service

Host

Internal

Purpose

nginx

8080 → 80

Edge

Reverse proxy

honeypot

—

8080

Fake application

dashboard

—

3000

SOC console

postgres

—

5432

Optional database

🔐 Container Isolation

The Docker configuration includes:

Non-root containers

Read-only root filesystems

Dropped Linux capabilities

no-new-privileges

Resource limits

Internal Docker network

Separate edge network

Database volumes

Architecture:

             Internet
                │
                ▼
        ┌───────────────┐
        │     nginx     │
        │   Edge Net    │
        └───────┬───────┘
                │
                ▼
       ┌─────────────────┐
       │ Internal Network│
       └───────┬─────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
  Honeypot         Dashboard
       │                │
       └───────┬────────┘
               ▼
           Database

🛡️ Security Hardening Checklist

For isolated lab deployments:

Use a dedicated host or VM

Use an isolated VLAN where appropriate

Never mount host credentials

Never mount SSH keys

Never expose internal services unnecessarily

Never expose PostgreSQL publicly

Put TLS in front of nginx for remote deployments

Enable secure cookies behind HTTPS

Keep container images patched

Export logs safely if forensic retention is required

Recommended environment:

Internet
   │
   ▼
Firewall
   │
   ▼
Isolated VM / Lab
   │
   ▼
Sentinel

🧠 Detection Result Model

Each detector returns a structure similar to:

{
  category: string;
  severity: "Info" | "Low" | "Medium" | "High" | "Critical";
  detected: boolean;
  reason: string;
  confidence: number;
}

The engine:

Runs enabled detectors

Collects matches

Merges results

Selects the highest severity

Combines detection reasons

Stores the resulting event

Generates alerts when thresholds are reached

📡 HTTP API

Base URL during development:

http://localhost:3000

Docker:

http://localhost:8080/soc

All routes require a valid authenticated session unless otherwise specified.

Method

Endpoint

Purpose

POST

/api/auth/login

Authenticate

POST

/api/auth/logout

Logout

GET

/api/auth/session

Session information

GET

/api/stats

Dashboard statistics

GET

/api/events

Event list/filter

GET

/api/events/:id

Event details

GET

/api/events/stream

SSE event stream

GET

/api/ips

IP aggregates

GET

/api/ips/:ip

IP details

GET

/api/logins

Authentication attempts

GET

/api/alerts

Recent alerts

GET / PUT

/api/rules

Detection rules

GET / PUT

/api/settings

Runtime settings

GET

/api/reports?format=json|csv|html

Reports

POST

/api/setup

First-run setup

🛒 Honeypot Routes

The fake BrightCart Commerce application exposes:

Route

Purpose

/

Fake storefront

/products

Product catalogue

/search?q=

Search

/login

Fake login trap

/admin

Fake admin page

/admin/login

Fake admin login trap

/dashboard

Fake customer dashboard

/api

Decorative API page

/contact

Contact page

*

Branded 404

Every request passes through the monitoring pipeline:

Rate Limit
    ↓
Capture
    ↓
Redaction
    ↓
Detection
    ↓
Database
    ↓
Alert

⚙️ Configuration

Application

Variable

Default

Description

NODE_ENV

development

Application environment

LOG_LEVEL

info

Logging level

Database

Variable

Default

Description

DB_CLIENT

sqlite

sqlite or postgres

SQLITE_FILE

./data/honeypot.db

SQLite database

DATABASE_URL

—

PostgreSQL connection

Honeypot

Variable

Default

HONEYPOT_PORT

8080

TRUST_PROXY

1

MAX_REQUEST_BODY_BYTES

65536

MAX_QUERY_LENGTH

2048

REQUEST_TIMEOUT_MS

15000

Dashboard

Variable

Default

PORT

3000

NEXT_PUBLIC_BASE_PATH

—

DASHBOARD_USER

admin

DASHBOARD_PASSWORD

Required

SESSION_COOKIE_NAME

hp_session

SESSION_TTL_HOURS

12

SECURE_COOKIES

0

Rate Limiting & Alerts

Variable

Default

RATE_LIMIT_MAX_REQUESTS

120

RATE_LIMIT_WINDOW_SECONDS

60

RATE_LIMIT_DELAY_MS

0

AUTH_ATTEMPT_THRESHOLD

5

SENSITIVE_PATH_THRESHOLD

10

REQUESTS_PER_MINUTE_ALERT

300

SCANNER_WINDOW_MINUTES

10

🧪 Testing

Run the complete test suite:

npm test

Watch mode:

npm run test:watch

Type checking:

npm run typecheck

Linting:

npm run lint

Test Coverage Areas

Authentication
      │
      ├── Session handling
      ├── Password hashing
      └── Redaction

Database
      │
      ├── Schema
      └── Repository operations

Detection
      │
      ├── All detectors
      ├── Severity
      └── Classification

Honeypot
      │
      ├── Request logging
      ├── Sensitive paths
      ├── Payload handling
      └── Login redaction

Rate Limiting
      │
      └── 429 behavior

Validation
      │
      └── Zod validation

📦 npm Scripts

Command

Description

npm run dev

Start honeypot + dashboard

npm run dev:honeypot

Start honeypot only

npm run dev:web

Start dashboard only

npm run build

Production dashboard build

npm start

Start built dashboard

npm run start:honeypot

Start honeypot

npm test

Run tests

npm run test:watch

Test watch mode

npm run lint

ESLint

npm run typecheck

TypeScript checking

npm run testdata

Generate development test data

🔎 Troubleshooting

Problem

Solution

EADDRINUSE

Stop the process using port 8080 or 3000

Dashboard returns 401

Sign in again or check session

Docker password error

Set DASHBOARD_PASSWORD in .env

No events

Verify the honeypot is running

SQLite locked

Avoid concurrent heavy writers

Wrong client IP

Verify TRUST_PROXY=1

PostgreSQL unavailable

Check DB_CLIENT and DATABASE_URL

Windows process issue

Run npm commands from a normal terminal

Docker Logs

docker compose logs -f nginx
docker compose logs -f honeypot
docker compose logs -f dashboard

🚫 Explicit Non-Features

Sentinel intentionally does not provide:

❌ Malware collection/distribution
❌ Exploit execution
❌ RCE / reverse shells
❌ Persistence mechanisms
❌ Credential stuffing
❌ DDoS tooling
❌ Retaliatory attacks
❌ Counter-scanning
❌ External port scanning
❌ Plaintext password storage

These boundaries are part of the project's defensive design.

🎓 Intended Use

Sentinel is suitable for:

Cybersecurity education

SOC training

Defensive monitoring

Honeypot research

Detection-engine development

Security demonstrations

Authorized security labs

HTTP attack-pattern analysis

Blue-team exercises

Use Sentinel only against systems and networks you own or are explicitly authorized to test.

🗺️ Project Roadmap

Potential future development areas:

Sentinel
│
├── 🔎 Detection
│   ├── Additional detectors
│   ├── Detection tuning
│   └── Correlation improvements
│
├── 📊 SOC
│   ├── Advanced analytics
│   ├── Investigation workflows
│   └── Expanded dashboards
│
├── 🚨 Alerts
│   ├── More alert channels
│   └── Improved correlation
│
├── 🗄️ Data
│   ├── Extended PostgreSQL support
│   └── Long-term event retention
│
└── 🐳 Infrastructure
    ├── Deployment improvements
    ├── Additional isolation options
    └── Operational hardening

📚 Learning Goals

Sentinel can be used to understand how a defensive monitoring system processes suspicious web traffic:

HTTP Request
     ↓
Observation
     ↓
Sanitization
     ↓
Detection
     ↓
Classification
     ↓
Persistence
     ↓
Correlation
     ↓
Alert
     ↓
Investigation
     ↓
Report

The goal is not simply to detect suspicious traffic, but to understand the complete lifecycle of a security event.

🤝 Contributing

Contributions are welcome when they maintain the project's defensive purpose.

Before contributing:

Keep attacker-controlled input inert.

Never introduce plaintext credential storage.

Do not add offensive attack automation.

Keep detection language appropriately cautious.

Add tests for new detection behavior.

Document new configuration variables.

Preserve the isolated-lab security model.

For substantial changes, open an issue first to discuss the proposed design.

📜 Responsible Use

Sentinel is intended for:

Authorized security research, education, defensive monitoring, and isolated laboratory environments.

You are responsible for deploying and using Sentinel only in environments you own or have explicit permission to test.

Misuse against systems or networks you do not control may violate laws, policies, or organizational rules.

📄 License

See the repository's license file for the applicable licensing terms.

<div align="center">

🛡️ Sentinel

Observe · Detect · Analyze · Learn

Defensive security engineering for controlled environments.

<br>

<img src="https://img.shields.io/badge/Defensive%20Security-Only-00C853?style=for-the-badge&logo=shield&logoColor=white" alt="Defensive Security Only"/>

</div>
