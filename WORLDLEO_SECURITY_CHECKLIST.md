# WorldLeo — Security & Data-Isolation Checklist

This document tracks security vulnerabilities remediated in **Stage 2 — Batch 2.1** and remaining items required before production launch with live payments.

---

## 1. Remediated in Stage 2 (Batch 2.1)

- [x] **Server-Side Firebase ID Token Verification (`server/firebaseAuth.ts` & `server.ts`):**
  - Verifies Google RS256 ID token signatures against Google's official JWKS endpoint (`aud`, `iss`, `exp`, `iat`, `sub`) before trusting identity claims.
  - Rejects forged, expired, or unsigned tokens and prevents email spoofing/takeover across password-based or staff (`admin`, `coordinator`, `finance`) accounts.
- [x] **Strict Production Auth & Secret Enforcement (`server/auth.ts`):**
  - Requires `SESSION_SECRET` (minimum 32 bytes) when `NODE_ENV=production` — throws on startup if omitted rather than falling back to weak/ephemeral defaults.
  - Disables demo credential bypass/auto-login routes when `NODE_ENV=production`.
  - Sets `HttpOnly; SameSite=Lax` session cookies (`Secure` when HTTPS) alongside Bearer API compatibility, and strips `localStorage` auth tokens for web clients.
- [x] **Single-Use Short-Lived SSE Tickets (`POST /api/notifications/sse-ticket`):**
  - Replaced long-lived JWT/session token query strings in `EventSource` URLs with 30-second single-use cryptographic SSE tickets.
- [x] **Granular Role-Based Access Control (RBAC) & Ownership Checks (`server.ts`):**
  - Enforces server-side role verification for `customer`, `provider`, `company_member`, `coordinator`, `finance`, and `admin`.
  - Prevents role escalation / self-demotion during `/api/provider/onboarding`.
  - Restricts `coordinator` from accessing `/api/admin/financial-summary` or category creation (`admin`-only); restricts `finance` from operational provider/dispute mutations and logs every financial summary read in `audit_logs`.
  - Scopes `company_member` users strictly to their affiliated `company_id` records.
  - Restricts job dispute filing strictly to the assigned `customer_id`, assigned `provider_id`, or operations staff (blocks unrelated providers).
  - Restricts request message threads (`/api/requests/:requestId/messages`) strictly to the owning customer, matched/assigned provider, or ops staff.
- [x] **Atomic Transaction & Concurrency Safeguards (`server/db.ts` & `server.ts`):**
  - Serialized `db.runTransaction()` with snapshot rollback prevents duplicate job creation on concurrent `POST /api/quotes/:quoteId/accept` calls, duplicate quotes per provider/request, and double `completed_jobs_count` increments.
  - Enforces a server-side finite-state machine (`ALLOWED_JOB_TRANSITIONS`) on `POST /api/provider/jobs/:jobId/status`.
  - Rejects negative/NaN/out-of-range pricing values server-side.
- [x] **Exact Address & Contact Masking (`server.ts`):**
  - Customer `exact_address` and `customer_phone` remain stripped from unaccepted provider reads until a quote is accepted and an assigned `Job` is created.

---

## 2. Remaining Production Pre-Launch Items (Post-Stage 2)

| Priority | Area | Status & Required Action |
| :--- | :--- | :--- |
| **High** | Multi-Instance Database Migration | Migrate from hardened `data/fixsoon.json` to hosted Firestore (`firebase-admin`) or Cloud SQL PostgreSQL before scaling beyond 1 instance or enabling live Stripe payouts. |
| **Medium** | API Rate Limiting & Schema Middleware | Add per-IP/user rate limiting middleware on `/api/auth/*`, `/api/requests`, and `/api/grounding/*` prior to public launch. |
| **Medium** | Demo Seed Cleanup in Production | Ensure seeded `is_demo` profiles/credentials are disabled/excluded in production launch config. |
| **Low** | Raster PWA Icon Export | Re-export `/public/pwa-192x192.png`, `/public/pwa-512x512.png`, and `/public/apple-touch-icon.png` from `/public/icon.svg` before public store/PWA publishing. |

---

## 3. Compliance & Truthfulness Guardrails

- [x] Legal pages (`/privacy`, `/terms`, `/contact`) remain clearly labeled **Draft / Placeholder — Pending Legal Review**.
- [x] `WorldLeoVerifiedBadge` renders ONLY when `business_verified && insurance_verified && profile_reviewed` are all `true`.
- [x] AI Design Studio (`/home/ai-design`) displays the mandatory engineering/contractor verification disclaimer.
