Sentinel
Web Honeypot & Security Operations Dashboard

A defensive security monitoring platform that combines a deliberately fake web application with an authenticated SOC dashboard for controlled security research, detection testing, and incident visibility.










Overview

Sentinel is a controlled web honeypot and security operations dashboard designed to observe suspicious HTTP activity and turn it into structured security events.

The system contains two primary components:

Component	Purpose
Web Honeypot	Deliberately fake application that receives and records suspicious requests
SOC Dashboard	Authenticated interface for investigating events, IP activity, alerts, detections and reports

Sentinel is designed for authorized security testing and isolated laboratory environments.

It does not execute attacker-controlled payloads and does not interact with external systems on behalf of an attacker.

Key Features
Web Honeypot
Fake e-commerce-style application
Suspicious request monitoring
Request metadata collection
Sensitive-path detection
Authentication monitoring
Scanner detection
Injection-pattern detection
Traversal detection
Unexpected HTTP method detection
Query inspection
Rate limiting
Safe payload handling
Security Detection Engine

Sentinel currently includes 10 detection categories:

Detector	Purpose
Admin Path	Detects access attempts against administrative paths
Authentication Probe	Detects suspicious authentication activity
Backup File	Detects requests for backup or sensitive files
Frequency	Detects unusual request frequency
Injection	Detects suspicious injection patterns
Recon Path	Detects reconnaissance-oriented paths
Scanner User-Agent	Detects known scanner-style user agents
Suspicious Query	Detects suspicious query parameters
Traversal	Detects path traversal patterns
Unexpected Method	Detects unexpected HTTP methods

Each detector produces a structured result containing:

Category
Severity
Detection status
Reason
Confidence
Detection Severity

Sentinel supports five severity levels:

Severity	Meaning
Info	Informational activity
Low	Low-risk suspicious activity
Medium	Moderate suspicious activity
High	High-risk activity
Critical	Critical detection

When multiple detectors match the same request, Sentinel evaluates the results and records the highest applicable severity.

Security Operations Dashboard

The dashboard provides a centralized interface for investigating monitored activity.

Dashboard Pages
Page	Purpose
/login	Dashboard authentication
/setup	Initial configuration
/dashboard	Security overview
/events	Security event investigation
/ips	IP activity overview
/ips/[ip]	Individual IP investigation
/authentication	Authentication activity
/rules	Detection rules
/reports	Security reports
/settings	System configuration
Live Monitoring

Sentinel supports a live event stream using Server-Sent Events (SSE).

The dashboard can receive new security events without repeatedly refreshing the page.

Incoming Request
       ↓
Request Analysis
       ↓
Detection Engine
       ↓
Security Event
       ↓
Alert Evaluation
       ↓
Database
       ↓
SSE Live Stream
       ↓
SOC Dashboard
Request Monitoring

For each monitored request, Sentinel can record structured metadata such as:

Data	Description
Timestamp	Request time
Method	HTTP method
Path	Requested route
Query	Query parameters
IP	Source IP
User-Agent	Client identification
Referer	Request origin
Status	HTTP response status
Response Size	Response size
Response Time	Processing duration
Headers	Sanitized request headers
Body Summary	Safe request-body summary
Detections	Detection results

Sensitive information is handled with sanitization and redaction mechanisms.

Alerting

Sentinel can generate alerts for events such as:

Authentication bursts
Scanner activity
Request-volume spikes
High-risk detection patterns

Alerts use a 15-minute deduplication window to reduce repeated notifications for the same activity pattern.

Database

Sentinel supports SQLite and PostgreSQL.

Core Tables
Table	Purpose
security_events	Recorded security events
login_events	Authentication activity
scan_sessions	Scanner/reconnaissance sessions
ip_activity	IP-based activity tracking
alerts	Generated security alerts
settings	Application configuration
detector_state	Detector state
dashboard_users	Dashboard users
dashboard_sessions	Authenticated sessions
Credential & Session Security

Sentinel uses several defensive mechanisms:

Password hashing with scrypt
Session identifiers stored as hashes
HttpOnly session cookies
Configurable session expiration
Optional secure cookies
Sanitized security-event logging
Redaction of sensitive information

Plaintext dashboard passwords should never be stored in the database.

Technology Stack
Layer	Technology
Runtime	Node.js 20+
Backend	Express 5
Language	TypeScript
Frontend	Next.js 16
UI	React 19
Styling	Tailwind CSS v4
Charts	Recharts
Database	SQLite / PostgreSQL
SQLite Driver	better-sqlite3
PostgreSQL Driver	pg
Containers	Docker
Orchestration	Docker Compose
Reverse Proxy	nginx
Testing	Vitest + Supertest
Linting	ESLint 9
Project Structure

The project is organized into clear application layers.

Directory / File	Responsibility
app/	Next.js application
components/	Reusable UI components
honeypot/	Honeypot server and request handling
database/	Database layer
lib/	Shared application logic
reports/	Report generation
scripts/	Development and utility scripts
tests/	Automated tests
docker/	Docker-related configuration
data/	Local database/runtime data
public/	Public static assets
types/	TypeScript types
proxy.ts	Proxy-related application logic
.env.example	Environment configuration template
package.json	Dependencies and scripts
tsconfig.json	TypeScript configuration
vitest.config.ts	Test configuration
Installation
Requirements

Before running Sentinel locally, install:

Node.js 20+
npm
Git

For containerized deployment:

Docker
Docker Compose
Quick Start

Clone the repository:

git clone <your-repository-url>
cd sentinel

Create the environment file:

Linux / macOS
cp .env.example .env
Windows PowerShell
Copy-Item .env.example .env

Set a dashboard password inside .env:

DASHBOARD_PASSWORD=your-secure-password

Install dependencies:

npm install

Start development mode:

npm run dev
Local URLs

When running the development environment:

Service	URL
Honeypot	http://localhost:8080
SOC Dashboard	http://localhost:3000
Testing the Honeypot

The following requests can be used inside an authorized local laboratory environment to generate test events.

Sensitive Path
curl http://localhost:8080/.env
Suspicious Search Query
curl "http://localhost:8080/search?q=<test-payload>"
Scanner User-Agent
curl -A "sqlmap/1.7.2" http://localhost:8080/admin/login
Unexpected HTTP Method
curl -X TRACE http://localhost:8080/
Fake Login Event
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

These examples are intended for the local Sentinel environment only.

Development Test Data

Sentinel provides a development-only test-data command:

npm run testdata

The command refuses to run when:

NODE_ENV=production

This helps prevent accidental insertion of development/demo data into production environments.

Docker

Build and start Sentinel:

docker compose up --build -d

Check running services:

docker compose ps

View logs:

docker compose logs -f

Stop the environment:

docker compose down

Remove containers and volumes:

docker compose down -v
Docker Architecture

The containerized deployment consists of the following services:

Service	Role	Internal Port
nginx	Edge reverse proxy	80
honeypot	Honeypot application	8080
dashboard	SOC dashboard	3000
postgres	Optional PostgreSQL database	5432

The default Docker edge is exposed through:

localhost:8080

Docker hardening includes:

Non-root containers
Read-only root filesystem where applicable
Dropped Linux capabilities
no-new-privileges
Resource limits
Internal and edge networks
Persistent database volumes
PostgreSQL

Sentinel can use PostgreSQL instead of SQLite.

Example configuration:

DB_CLIENT=postgres
DATABASE_URL=postgresql://honeypot:honeypot@postgres:5432/honeypot
POSTGRES_PASSWORD=honeypot

The PostgreSQL deployment is available through the Docker configuration/profile supplied by the project.

Configuration

Important environment variables include:

Variable	Purpose
NODE_ENV	Application environment
LOG_LEVEL	Logging level
DB_CLIENT	SQLite or PostgreSQL
SQLITE_FILE	SQLite database location
DATABASE_URL	PostgreSQL connection
HONEYPOT_PORT	Honeypot port
TRUST_PROXY	Proxy trust configuration
MAX_REQUEST_BODY_BYTES	Request body limit
MAX_QUERY_LENGTH	Query length limit
REQUEST_TIMEOUT_MS	Request timeout
PORT	Dashboard port
DASHBOARD_USER	Dashboard username
DASHBOARD_PASSWORD	Dashboard password
SESSION_COOKIE_NAME	Session cookie name
SESSION_TTL_HOURS	Session lifetime
SECURE_COOKIES	Secure cookie configuration
RATE_LIMIT_MAX_REQUESTS	Rate-limit threshold
RATE_LIMIT_WINDOW_SECONDS	Rate-limit window
AUTH_ATTEMPT_THRESHOLD	Authentication alert threshold
SENSITIVE_PATH_THRESHOLD	Sensitive-path threshold
REQUESTS_PER_MINUTE_ALERT	Request-volume alert threshold
SCANNER_WINDOW_MINUTES	Scanner detection window
HTTP API
Authentication
Method	Endpoint
POST	/api/auth/login
POST	/api/auth/logout
GET	/api/auth/session
Security Data
Method	Endpoint
GET	/api/stats
GET	/api/events
GET	/api/events/:id
GET	/api/events/stream
GET	/api/ips
GET	/api/ips/:ip
GET	/api/logins
GET	/api/alerts
Configuration
Method	Endpoint
GET	/api/rules
PUT	/api/rules
GET	/api/settings
PUT	/api/settings
POST	/api/setup
Reports
GET /api/reports?format=json
GET /api/reports?format=csv
GET /api/reports?format=html
Honeypot Routes

The deliberately fake web application exposes routes including:

/
├── /products
├── /search?q=
├── /login
├── /admin
├── /admin/login
├── /dashboard
├── /api
├── /contact
└── *

These routes exist inside the controlled honeypot environment and are intended for monitoring and detection testing.

Detection Result Model

Each detector returns a structured result:

{
  category: string;
  severity: "Info" | "Low" | "Medium" | "High" | "Critical";
  detected: boolean;
  reason: string;
  confidence: number;
}

The detection pipeline follows this process:

Request
  ↓
Enabled Detectors
  ↓
Detection Results
  ↓
Merge Matches
  ↓
Determine Highest Severity
  ↓
Combine Reasons
  ↓
Store Security Event
  ↓
Generate Alert When Required
Test Coverage

The automated test suite covers the major security and application layers.

Area	Coverage
Authentication	Session handling, password hashing, redaction
Database	Schema and repository operations
Detection	Detectors, severity, classification
Honeypot	Request logging, sensitive paths, payload handling, login redaction
Rate Limiting	429 behavior
Validation	Zod validation

Run tests:

npm test

Run tests in watch mode:

npm run test:watch

Run linting:

npm run lint

Run type checking:

npm run typecheck
npm Scripts
Command	Description
npm run dev	Start development environment
npm run dev:honeypot	Start honeypot development server
npm run dev:web	Start dashboard development server
npm run build	Build application
npm start	Start dashboard
npm run start:honeypot	Start honeypot
npm test	Run tests
npm run test:watch	Run tests in watch mode
npm run lint	Run ESLint
npm run typecheck	Run TypeScript checks
npm run testdata	Generate development test data
Security Hardening

For controlled deployments, consider the following:

Run Sentinel on a dedicated host or VM
Use an isolated VLAN/network
Do not expose host credentials or SSH keys
Avoid unnecessary public exposure
Use TLS for remote deployments
Enable secure cookies behind HTTPS
Keep container images patched
Review exported security logs before sharing them
Restrict access to the SOC dashboard
Use strong dashboard credentials
Explicit Non-Features

Sentinel intentionally does not provide functionality for:

Executing attacker-controlled payloads
Storing plaintext passwords
Scanning external systems
Attacking third-party infrastructure
Automated exploitation
Unauthorized credential collection
Uncontrolled public honeypot deployment

The project is designed around observation, detection, logging and defensive analysis.

Responsible Use

Sentinel should only be deployed in environments where you have authorization to monitor the traffic and systems involved.

Recommended use cases include:

Security education
Detection engineering
SOC training
Honeypot research
HTTP monitoring experiments
Defensive security testing
Local security laboratories
Controlled incident-response exercises

Do not deploy the system against infrastructure you do not own or have explicit permission to monitor.

Roadmap

Potential future improvements include:

Expanded detector library
Additional visualization components
Improved event correlation
More detailed IP investigation
Additional report formats
Enhanced alert management
Extended PostgreSQL capabilities
Additional security telemetry
More automated test coverage
Learning Goals

Sentinel provides a practical environment for exploring:

Web security monitoring
Honeypot architecture
Detection engineering
Security event pipelines
SOC dashboard design
HTTP telemetry
Authentication security
Database-backed security systems
Container security
Defensive automation
Contributing

Contributions should maintain the project's defensive purpose.

Before submitting changes:

npm run lint
npm run typecheck
npm test

When adding a new detector, document:

What it detects
Why it matters
Expected severity
Detection conditions
False-positive considerations
Test coverage
License

See the repository license file for the applicable licensing terms.

Sentinel

Observe. Detect. Investigate.

A controlled security monitoring environment for learning, detection engineering and defensive security research.
