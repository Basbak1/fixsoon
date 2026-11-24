# WorldLeo — Changelog

## Phase 1 — Foundation & WorldLeo Rebranding (2026-11-23)

### Documentation Added
- Created `WORLDLEO_PRODUCT_SPEC.md`, `WORLDLEO_ARCHITECTURE.md`, `WORLDLEO_ROADMAP.md`, `WORLDLEO_SECURITY_CHECKLIST.md`, and `WORLDLEO_CHANGELOG.md`.

### Branding & Visual System
- Created `src/components/WorldLeoLogo.tsx` featuring a refined geometric lion crest and `WorldLeo` wordmark.
- Updated `src/components/FixSoonLogo.tsx` preserving the exact `FixSoon` spelling with a compact speed/motion emblem tailored to WorldLeo Auto's rapid roadside branch.
- Applied WorldLeo's Luxury Black & Refined Gold design tokens across Daytime (`#F4F2EC` background, `#FFFFFF` cards, `#171717` text, `#55534E` secondary, `#D8D4CA` borders, `#A87919` gold) and Nighttime (`#0D0F12` background, `#171A1F` cards, `#22262D` elevated, `#F1EFE8` text, `#B5B7BB` secondary, `#343941` borders, `#D8B45A` gold), keeping Light/Dark/Device switching in `ThemeContext` and `Footer`.

### Pages, Navigation & SEO
- Rebranded `HomePage.tsx` (`/`) to **WorldLeo** (*"WorldLeo — Find professionals. Plan projects. Get things done."*) with dual entry points for **WorldLeo Home** and **WorldLeo Auto / FixSoon** (direct urgent access without forcing Home content), AI Design Studio preview, Model A+ / Model B explanation, Ontario coverage, and honest demo/verified-only disclosures.
- Added `src/pages/WorldLeoPages.tsx` for `/home`, `/home/ai-design`, `/home/kitchen-renovation`, `/home/bathroom-renovation`, `/home/backyard-design`, `/auto`, `/auto/fixsoon`, `/contact`, `/privacy`, and `/terms` with honest Development Preview and Pending Legal Review notices.
- Updated `Header.tsx`, `Footer.tsx`, `Breadcrumbs.tsx`, `src/lib/seo.ts`, `index.html`, `vite.config.ts`, and `server.ts` (`/sitemap.xml`, `/api/faqs`) while preserving all existing marketplace workflows (`/request`, `/professionals/*`, `/services/*`, `/locations/*`, dashboards, onboarding, admin).

### Backend Security & Mobile API Readiness
- Replaced hardcoded `TOKEN_SECRET` fallback in `server/auth.ts` with runtime `crypto.randomBytes(32)` generation when `SESSION_SECRET` is unset.
- Added strict participant authorization checks on `GET` and `POST` `/api/requests/:requestId/messages` in `server.ts`.
- Added privilege/account-takeover guard on `POST /api/auth/firebase`.
- Added `/api/v1/health`, `/api/v1/config` (exposing safe feature flags and `planningPackPriceCad: 39`), and `/api/v1/*` API aliases for future Expo + React Native mobile apps.
- Added `?urgency=emergency` query support on `/request` for direct FixSoon rapid-help entry.
