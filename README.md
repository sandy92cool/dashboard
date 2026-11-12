# 🛡️ Insurance Journey Analytics Platform

Enterprise-grade full-stack insurance analytics platform migrated to a modern **React 18** frontend and **Node.js / Express** backend with **zero-trust security hardening** for penetration testing compliance.

---

## 🌟 Key Architectural Highlights

### 🎨 Modern Frontend (React 18 + Vite + Tailwind CSS + Lucide)
- **Fintech UI/UX**: Dark-mode glassmorphic theme designed for executive dashboards and underwriting operations.
- **Unified Views**:
  1. **📊 Dashboard**:
     - 1-month date range filter by default with interactive calendar range picker and quick presets (*1 Month*, *Last 7 Days*, *All Time*).
     - Key Business KPIs: *Total Logins Happened*, *Application Submissions* (with conversion rate %), *Active Applications*, and *User Drop-Offs*.
     - **Different status and their counts**: Direct visibility into production statuses (`APP_SUBMITTED`, `JOURNEY_ACTIVE`, `JORUNEY_COMPLETE`, `OFFER_EXPIRED`, `USER_DROPPED`).
     - **Trending Product Spotlight**: Real-time identification of top-velocity product (`C2PL`).
     - **Product Submissions & Demographics**: Interactive breakdown showing which age groups (`18-25`, `26-35`, `36-45`, `46-55`, `56+`) and locations (Bengaluru, Mumbai, Delhi, Pune, etc.) have the highest demand.
  2. **🔍 Application & Customer Lookup**:
     - Search by **Application Number** (e.g. `APP-2026-10001`): Displays policy details, sum assured, premium amount, payment frequency, PPT, policy term, drop page, and journey timeline.
     - Search by **Mobile Number** (e.g. `9820010004`): Displays customer profile + 3 distinct tables:
       - *Active & Submitted Applications*
       - *Offers Generated (Product & Sum Assured)*
       - *Ineligible Offers & Causes/Errors*
  3. **🤖 AI Insights & Copilot**:
     - Executive AI diagnostics and bottleneck recommendations.
     - Natural language AI Copilot answering queries on conversions and trends.
- **Zero Raw Table Names**: No mention of MongoDB collection names or raw spreadsheet filenames in the UI.

---

### 🔒 Enterprise Security Hardening (Zero Pentest Vulnerabilities)

| Security Category | Implementation & Defense Mechanism |
|---|---|
| **NoSQL Injection Prevention** | Strict input validation via **Zod**, schema enforcement, and recursive query sanitizer stripping dangerous MongoDB operators (`$ne`, `$gt`, `$where`, `.`). |
| **Strict Security Headers** | **Helmet** configured with strict CSP (`default-src 'self'`), `X-Frame-Options: DENY` (anti-Clickjacking), `X-Content-Type-Options: nosniff`, and `Referrer-Policy`. |
| **Strict Transport Security (HSTS)** | 1-year preload HSTS (`max-age=31536000; includeSubDomains; preload`). |
| **Brute Force & DoS Defense** | `express-rate-limit` windowing (600 requests / 15 minutes) with strict request body limits (`limit: 100kb`). |
| **HTTP Parameter Pollution** | `hpp` middleware preventing parameter array poisoning attacks. |
| **XSS & Output Sanitization** | React JSX contextual auto-escaping + zero `dangerouslySetInnerHTML`. |
| **Server Cloaking** | `X-Powered-By: Express` disabled to prevent fingerprinting by vulnerability scanners. |
| **Secure Error Handling** | Stack traces, file paths, and database internals are completely suppressed in production error responses. |
| **Package Vulnerability Audit** | **0 vulnerabilities** across all server and client dependencies (`npm audit`). |

---

## 🚀 Running the Application

### Option A: Complete Production Server (Port 8000)
Runs the Node.js backend serving both API endpoints and the optimized React production bundle:
```bash
npm start
# Visit http://localhost:8000
```

### Option B: Full-Stack Development Mode (Ports 8000 & 3000)
1. **Start Backend Server:**
   ```bash
   npm run dev:server
   # API running at http://localhost:8000
   ```
2. **Start React Vite Client (Hot Reloading):**
   ```bash
   npm run dev:client
   # Frontend running at http://localhost:3000
   ```

---

## 🧪 Automated Testing
Run automated backend and security validation tests:
```bash
npm test
```
All unit tests and API integration tests execute against the embedded resilient data layer and MongoDB drivers.
