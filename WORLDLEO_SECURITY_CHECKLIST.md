# WorldLeo — Security & Data-Isolation Checklist

This document tracks verified security controls, issues remediated in Phase 1, and remaining items required before production launch.

---

## 1. Remediated in Phase 1

- [x] **Removed Hardcoded Session Secret Fallback (`server/auth.ts`):**
  - *Before:* Used hardcoded fallback string `'fixsoon-dev-session-secret-change-in-prod'` when `process.env.SESSION_SECRET` was missing.
  - *After:* Generates a cryptographically strong ephemeral 32-byte random secret per process (`crypto.randomBytes(32).toString('hex')`) when `SESSION_SECRET` is unset, ensuring no static default signing key exists in source code.
- [x] **Fixed Request Message Thread Authorization (`server.ts` — `GET/POST /api/requests/:requestId/messages`):**
  - *Before:* Any authenticated user could read or post messages to any `requestId`.
  - *After:* Enforces strict participant authorization — only the request's `customer_id`, an approved provider matched via `request_matches` or assigned via `jobs`, or an `admin` can read or post messages on that request.
- [x] **Hardened Firebase Login Endpoint (`server.ts` — `POST /api/auth/firebase`):**
  - *Before:* Accepted client-supplied `{ uid, email }` and matched any existing user by email, creating an account-takeover risk for seeded/admin accounts.
  - *After:* Blocks matching any `admin` account or non-Firebase account (`!id.startsWith('usr_fb_')`) via unverified client payloads; requires full server-side Firebase Admin ID token verification before merging accounts in Phase 2.
- [x] **Preserved Exact Customer Address & Phone Masking (`server.ts` — `GET /api/provider/dashboard`):**
  - Verified that `exact_address` and `customer_phone` remain stripped (`undefined`) on `matchedRequests` until a customer accepts a quote and creates an assigned `Job`.

---

## 2. Outstanding Risks & Mandatory Phase 2 Actions (Before Production Launch)

| Priority | Area | Finding & Required Fix |
| :--- | :--- | :--- |
| **High** | Database Persistence | `server/db.ts` stores all state in `data/fixsoon.json`. Migrate to a transactional database (Firestore via Admin SDK or Cloud SQL PostgreSQL) before hosting concurrent real users or payments. |
| **High** | Firebase ID Token Verification | Add `firebase-admin` `getAuth().verifyIdToken(idToken)` on `/api/auth/firebase` (and `/api/v1/auth/firebase`) so client identity claims cannot be forged. |
| **High** | Session Token Storage & SSE | Web client stores Bearer token in `localStorage` (`fixsoon_token`) and opens EventSource with `?token=...`. Migrate web sessions to `HttpOnly; Secure; SameSite=Lax` cookies and issue short-lived single-use SSE tickets for `/api/notifications/stream`. |
| **Medium** | Rate Limiting & Input Validation | Add Express rate-limiting middleware on `/api/auth/*`, `/api/requests`, and `/api/grounding/*` plus schema validation (`zod`) on all JSON payloads. |
| **Medium** | Demo Seed Accounts | `AuthPage.tsx` exposes one-click demo account logins and `server/db.ts` seeds `FixSoon2026!` demo users. Disable demo quick-login buttons and demo credentials when `NODE_ENV=production` & live launch flag is enabled. |
| **Low** | Secrets & Env Management | Ensure `SESSION_SECRET`, `GEMINI_API_KEY`, `VITE_GOOGLE_MAPS_API_KEY`, and future Stripe/Firebase Admin credentials are supplied exclusively via server environment variables / secret manager and never committed to git. |

---

## 3. Compliance & Truthfulness Guardrails

- [x] Legal pages (`/privacy`, `/terms`, `/contact`) are explicitly labeled **Draft / Placeholder — Pending Legal Review** and do not misrepresent generated copy as attorney-approved policies.
- [x] Demo providers (`is_demo: true`) are labeled clearly in the UI; no fabricated reviews, verification claims, or fake arrival guarantees are presented as live marketplace telemetry.
- [x] AI Design Studio (`/home/ai-design`) clearly warns that indicative 2D layouts/visuals require verification by a qualified contractor or licensed engineer before construction or permitting.
