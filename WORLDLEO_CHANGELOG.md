# WorldLeo — Changelog

## Stage 2 — Batch 2.1 & Batch 2.2 (2026-11-24)

### Batch 2.1 — Security & Database Foundation
- Added server-side Google JWKS RS256 Firebase ID token verification in `server/firebaseAuth.ts` and enforced verified claim-only auth in `POST /api/auth/firebase`.
- Enforced `SESSION_SECRET` (`>=32` bytes) in `NODE_ENV=production`, disabled demo shortcuts in production, switched web sessions to `HttpOnly; SameSite=Lax` cookies, and replaced EventSource query tokens with 30-second single-use SSE tickets (`POST /api/notifications/sse-ticket`).
- Hardened RBAC across `customer`, `provider`, `company_member`, `coordinator`, `finance`, and `admin` roles; blocked cross-account IDOR reads, unrelated provider disputes, onboarding privilege demotion/escalation, and coordinator access to `/api/admin/financial-summary`.
- Added serialized write lock + snapshot rollback transactions (`db.runTransaction()`), atomic duplicate quote/job race guards, server-side `ALLOWED_JOB_TRANSITIONS` state machine validation, and automatic pre-v2 database backup (`data/fixsoon.backup.stage2.json`).
- Added automated security test suite `tests/batch2_1.security.test.ts` (7 test suites).

### Batch 2.2 — Final WorldLeo Brand Identity, Navigation & Hierarchy
- Created approved flat vector **WorldLeo** symbol (**bold W + smooth orbit + calm friendly Leo head**) across `/public/icon.svg` and `src/components/WorldLeoLogo.tsx` (`horizontal`, `compact`, `symbol` variants; `auto`, `light`, `dark`, `monochrome` tones; simplified symbol mode at `<=22px`).
- Retired the shield/checkmark logo from the corporate mark and isolated it as `WorldLeoVerifiedBadge` (`src/components/WorldLeoVerifiedBadge.tsx`), displayed strictly when `business_verified && insurance_verified && profile_reviewed`.
- Added `LeoAmbassadorAvatar.tsx` for **Leo** and repositioned **FixSoon** (`FixSoonLogo.tsx`) strictly under **WorldLeo Auto**.
- Migrated all components, pages, `index.html`, `vite.config.ts`, and `src/index.css` from the interim black/amber palette to the approved Forest Green & Muted Gold palette (`#063B2B`, `#071E17`, `#145443`, `#C6A45B`, `#D8B66F`, `#9F7B37`, `#F6F2E8`, `#F8F7F2`, `#171B19`, `#6D756F`).
- Updated Header/Footer navigation, added `/home/repairs`, `/home/renovations`, `/request-service` (division-first Step 1), role-based `/dashboard` routing, and Operations Finance tab (`src/lib/commissions.ts` + `AdminDashboard.tsx`).
- Added automated UI/brand/SEO/commission test suite `tests/batch2_2.ui.test.ts` (4 test suites).

---

## Stage 1 — Foundation & Initial Rebranding (2026-11-23)
- Initial repository audit, living documentation creation, `/api/v1/*` mobile API aliases, and initial WorldLeo Home / Auto / FixSoon route scaffolding.
