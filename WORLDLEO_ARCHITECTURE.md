# WorldLeo — System Architecture (Stage 2: Batches 2.1 & 2.2)

**Last Updated:** Stage 2 — Batches 2.1 & 2.2  
**Runtime Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Express (`server.ts`, port `3000`)

---

## 1. Repository Topology

### Frontend (`/src`)
| Module | Responsibility | Stage 2 Status |
| :--- | :--- | :--- |
| `src/App.tsx` | Client-side router (`window.history.pushState`), role-based `/dashboard` router (`DashboardRoleRouter`), `/request-service` route alias, catalog bootstrap | Updated (Batch 2.2) |
| `src/context/ThemeContext.tsx` | `light` / `dark` / `system` theme controller (`worldleo_theme` + `fixsoon_theme` migration) | Active |
| `src/context/AuthContext.tsx` | HttpOnly cookie-backed session state + legacy token cleanup + Firebase Google Auth ID-token handoff | Hardened (Batch 2.1) |
| `src/components/WorldLeoLogo.tsx` | Approved flat vector **bold W + smooth orbit + calm Leo head** symbol (`WorldLeoSymbol`, simplified tiny-size fallback `<=22px`) and `WorldLeoLogo` (`horizontal`, `compact`, `symbol`; `auto`, `light`, `dark`, `monochrome`) | Replaced shield (Batch 2.2) |
| `src/components/WorldLeoVerifiedBadge.tsx` | Separate shield+checkmark verification badge rendered ONLY when `business_verified && insurance_verified && profile_reviewed` | Added (Batch 2.2) |
| `src/components/LeoAmbassadorAvatar.tsx` | Calm friendly minimalist **Leo** brand ambassador emblem | Added (Batch 2.2) |
| `src/components/FixSoonLogo.tsx` | Subordinate **WorldLeo Auto → FixSoon** rapid roadside sub-badge | Updated (Batch 2.2) |
| `src/components/Header.tsx` & `Footer.tsx` | Unified WorldLeo parent navigation (`Home Services`, `Auto Services`, `AI Design Studio`, `Find Professionals`, `How It Works`, `For Professionals`), nested FixSoon, theme switcher | Updated (Batch 2.2) |
| `src/components/NotificationBell.tsx` | REST notifications + short-lived single-use SSE ticket stream (`POST /api/notifications/sse-ticket`) | Hardened (Batch 2.1) |
| `src/pages/HomePage.tsx` | Homepage featuring *"Your Home. Your Vehicle. One Trusted Place for Help."*, balanced Home vs Auto entry, AI Design Studio + Leo + FixSoon spotlights, verified directory preview | Updated (Batch 2.2) |
| `src/pages/WorldLeoPages.tsx` | `/home`, `/home/repairs`, `/home/renovations`, `/home/ai-design`, `/home/kitchen-renovation`, `/home/bathroom-renovation`, `/home/backyard-design`, `/auto`, `/auto/fixsoon`, `/contact`, `/privacy`, `/terms` | Updated (Batch 2.2) |
| `src/pages/RequestFlowPage.tsx` | Explicit **WorldLeo Home vs WorldLeo Auto** division choice at Step 1, filtered categories/subcategories, FixSoon roadside toggle strictly scoped to Auto | Updated (Batch 2.2) |
| `src/pages/AdminDashboard.tsx` | Operations Console supporting `admin`, `coordinator` (ops-only), and `finance` (financial summary & progressive fee schedule only) | Updated (Batches 2.1 & 2.2) |
| `src/lib/commissions.ts` | Progressive commission tiers (`25% / 15% / 10% / 5% / 2.5%`) & `isWorldLeoVerified` guard | Added (Batch 2.2) |

### Backend (`/server.ts` & `/server/*`)
| Module | Responsibility | Stage 2 Notes |
| :--- | :--- | :--- |
| `server.ts` | Express API server + Vite middleware (dev) / `dist` static serving (prod), strict RBAC (`admin`, `coordinator`, `finance`, `provider`, `company_member`, `customer`), `/api/*` & `/api/v1/*` routes | Hardened (Batch 2.1) |
| `server/firebaseAuth.ts` | Server-side Firebase ID token verifier using Google JWKS RS256 certificates (`aud`, `iss`, `exp`, `iat`, `sub`) + test override hook | Added (Batch 2.1) |
| `server/auth.ts` | `scrypt` password hashing, HMAC-SHA256 session tokens, `HttpOnly; SameSite=Lax` cookie parsing, single-use SSE ticket issuance/redemption | Hardened (Batch 2.1) |
| `server/db.ts` | Schema v2 persistence (`data/fixsoon.json`) with serialized write lock, atomic temp-file + rename persistence, rollback-capable `runTransaction()`, auto pre-v2 backup (`data/fixsoon.backup.stage2.json`) | Hardened (Batch 2.1) |
| `server/matching.ts` | Division-aware keyword classifier (`home` vs `auto`) & city/category/availability match scoring | Updated (Batches 2.1 & 2.2) |
| `server/notifications.ts` | Role/user-scoped notification store + ticket-authenticated SSE stream dispatcher | Hardened (Batch 2.1) |

---

## 2. Database Reliability & Production Migration Plan

### Why `data/fixsoon.json` Was Hardened Now & Production Migration Path
- In Stage 2 Batch 2.1, `server/db.ts` was hardened in-place with serialized async mutex queues, `runTransaction()` snapshot rollback on failure, and atomic temp-file + rename writes to eliminate race conditions (e.g., concurrent duplicate quote acceptance) without introducing an unprovisioned external database mid-sprint.
- **Multi-Instance Production Limitation:** Local JSON file persistence is single-node only and must be migrated to a hosted transactional database (Cloud Firestore via `firebase-admin` or Cloud SQL PostgreSQL via Drizzle) before horizontal scaling across multiple Cloud Run instances or enabling live Stripe Connect payouts.

### Proposed Production Document / Relational Structure
1. **`users` (`id`, `firebase_uid`, `email`, `role`, `company_id`, `is_active`, `saved_provider_ids`)** — Unique index on `email`, sparse unique index on `firebase_uid`.
2. **`companies` (`id`, `name`, `owner_user_id`, `member_user_ids`)** — Scopes `company_member` provider access strictly to affiliated provider profiles.
3. **`provider_profiles` (`id`, `user_id`, `company_id`, `slug`, `status`, `verifications`, `category_ids`, `coverage_cities`)** — Unique index on `slug`; composite index on `(status, primary_city)`.
4. **`service_requests` (`id`, `customer_id`, `request_type`, `target_provider_id`, `division`, `category_id`, `status`, `exact_address`)** — Composite index on `(customer_id, created_at)` and `(status, city)`; `exact_address` and `customer_phone` never projected onto unaccepted provider reads.
5. **`quotes` (`id`, `request_id`, `provider_id`, `status`, `estimated_price`)** — Transactional uniqueness guard: at most one active `accepted` quote per `request_id`.
6. **`jobs` (`id`, `request_id`, `quote_id`, `customer_id`, `provider_id`, `status`, `status_history`)** — Unique constraint on `request_id` (prevents duplicate active assignments) and `quote_id`.
7. **`messages` (`id`, `request_id`, `sender_id`, `sender_role`, `body`)** — Composite index on `(request_id, created_at)`.
8. **`disputes` & `audit_logs`** — Immutable append-only operational/security audit trail with `(created_at)` descending index.

### Migration & Rollback Procedure
1. **Pre-Migration Snapshot:** Copy `data/fixsoon.json` to `data/fixsoon.pre-prod-migration.json` with SHA-256 checksum verification (`data/fixsoon.backup.stage2.json` already preserves pre-Stage-2 baseline).
2. **Idempotent Upsert Script:** Read validated JSON entities in topological dependency order (`users` -> `companies` -> `provider_profiles` -> `service_categories` -> `service_requests` -> `quotes` -> `jobs` -> `messages` -> `reviews` -> `disputes` -> `audit_logs`) using deterministic primary IDs so re-runs are idempotent.
3. **Dual-Read Verification:** Compare record counts and sample checksums before switching backend repository adapter.
4. **Rollback:** Keep the signed `data/fixsoon.pre-prod-migration.json` backup intact for 30 days; switch storage adapter env flag back to snapshot restore if cutover verification fails.
