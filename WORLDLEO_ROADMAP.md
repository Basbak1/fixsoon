# WorldLeo — Multi-Phase Implementation Roadmap

This roadmap tracks the staged evolution of **WorldLeo** (`WorldLeo Home` + `WorldLeo Auto` + `AI Design Studio` + `FixSoon`).

---

## Stage 1 — Rebranding & Marketplace Baseline *(Completed)*
- [x] Audit existing FixSoon codebase and establish living project documentation
- [x] Unify dual Home + Auto marketplace routing, SEO metadata, and Ontario coverage pages

---

## Stage 2 — Security Foundation, Brand Identity & Navigation *(Completed — Current Stop Point)*

### Batch 2.1 — Security & Database Foundation
- [x] Server-side Google JWKS RS256 Firebase ID token verification (`server/firebaseAuth.ts`)
- [x] Production `SESSION_SECRET` guard, `HttpOnly; SameSite=Lax` session cookies, single-use 30s SSE tickets
- [x] Granular RBAC (`customer`, `provider`, `company_member`, `coordinator`, `finance`, `admin`) and audited financial endpoints
- [x] Atomic `db.runTransaction()` rollback wrapper, duplicate quote/job race protection, and validated job state machine
- [x] Automated security test suite (`tests/batch2_1.security.test.ts` — 7/7 passing)

### Batch 2.2 — Final WorldLeo Brand Identity, Navigation & Homepage
- [x] Approved flat vector **bold W + smooth orbit + calm friendly Leo head** symbol (`/public/icon.svg` & `WorldLeoLogo.tsx`, including light/dark/monochrome/compact/symbol variants and tiny-size simplification)
- [x] Separate **WorldLeo Verified** shield badge strictly gated on `business_verified && insurance_verified && profile_reviewed`
- [x] Approved **Forest Green & Muted Gold** color system (`#063B2B`, `#071E17`, `#145443`, `#C6A45B`, `#D8B66F`, `#9F7B37`, `#F6F2E8`, `#F8F7F2`, `#171B19`, `#6D756F`) across all pages and components
- [x] Corrected brand hierarchy: **WorldLeo** parent brand, **WorldLeo Home** (with **AI Design Studio** & **Leo** ambassador), **WorldLeo Auto** (with nested **FixSoon** rapid roadside feature)
- [x] Updated navigation, `/home/repairs`, `/home/renovations`, `/request-service` (division-first Step 1), `/dashboard` role router, and Operations Finance Fee Schedule tab
- [x] Automated brand/SEO/badge/commission test suite (`tests/batch2_2.ui.test.ts` — 4/4 passing)

---

## Batch 2.3 — Hosted Production Database Cutover & Verification Workflows *(Recommended Next)*
- [ ] Migrate hardened `data/fixsoon.json` store to hosted Cloud Firestore (`firebase-admin`) or Cloud SQL PostgreSQL
- [ ] Re-export raster PNG PWA icons (`pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`) from `/public/icon.svg`
- [ ] Provider document upload & inspection workflow for business/insurance/trade-licence verification
- [ ] Add Express rate limiting middleware on auth, request creation, and grounding endpoints

---

## Stage 3+ — Managed Booking, Escrow Payments, Live Dispatch & AI Studio *(Future)*
- [ ] Stripe Connect escrow & progressive payout automation (deferred until explicit approval)
- [ ] Live FixSoon roadside telemetry & Web Push / FCM live notifications
- [ ] Live Gemini AI Design Studio generation & CAD $39 Planning Pack PDF export
- [ ] Native Expo + React Native iOS & Android clients sharing `/api/v1/*` contracts
