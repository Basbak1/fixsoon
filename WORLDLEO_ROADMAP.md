# WorldLeo — Multi-Phase Implementation Roadmap

This roadmap tracks the staged evolution from FixSoon into the full **WorldLeo** marketplace (Home + Auto + FixSoon + AI Design Studio + Mobile Apps).

---

## Phase 1 — Foundation & WorldLeo Rebranding *(Current Phase)*
- [x] Full codebase, route, auth, persistence, and security audit
- [x] Create living project documentation (`PRODUCT_SPEC`, `ARCHITECTURE`, `ROADMAP`, `SECURITY_CHECKLIST`, `CHANGELOG`)
- [x] Rebrand parent platform to **WorldLeo** with refined geometric lion logo (`WorldLeoLogo`) and keep **FixSoon** as compact Auto rapid-response sub-brand (`FixSoonLogo`)
- [x] Apply Luxury Black & Refined Gold design system across Daytime (`#F4F2EC` / `#A87919`) and Nighttime (`#0D0F12` / `#D8B45A`) themes with Day/Night/Device toggle
- [x] Build dual-entry WorldLeo homepage (`/`) + dedicated landing/preview pages: `/home`, `/home/ai-design`, `/home/kitchen-renovation`, `/home/bathroom-renovation`, `/home/backyard-design`, `/auto`, `/auto/fixsoon`, `/for-professionals`, `/contact`, `/privacy`, `/terms`
- [x] Preserve all existing FixSoon marketplace flows (`/request`, `/professionals`, `/services/*`, `/locations/*`, dashboards, admin)
- [x] Apply immediate Phase 1 security hardening (`SESSION_SECRET` random runtime fallback, message thread authorization checks, `/api/auth/firebase` privilege guard)
- [x] Add `/api/v1/health`, `/api/v1/config`, and `/api/v1/*` API aliases for future Expo + React Native clients

---

## Phase 2 — Persistent Database Consolidation, Auth Hardening & Admin Controls *(Next)*
- [ ] Migrate `server/db.ts` from `data/fixsoon.json` to persistent production database (Firestore via Admin SDK or Cloud SQL PostgreSQL)
- [ ] Verify Firebase ID tokens server-side (`firebase-admin`) inside `/api/v1/auth/firebase`
- [ ] Migrate web auth sessions to HttpOnly `SameSite=Lax` cookies (and short-lived SSE tickets instead of query tokens) while retaining Bearer tokens for native mobile clients
- [ ] Activate admin-configurable feature flags and **CAD $39 AI Design Planning Pack** price setting in the Operations Console
- [ ] Activate **WorldLeo Home** contractor categories (Kitchen, Bathroom, Backyard, Appliance, Plumbing, Electrical) with dedicated onboarding verification checks

---

## Phase 3 — Managed Booking, Model A+ Pricing & Escrow Payments
- [ ] Integrate Stripe Connect (customer checkout hold / escrow, platform fee split, automated pro payouts) — *requires explicit user approval & Stripe keys*
- [ ] Support **Model A+ Fixed/Instant Roadside Dispatch** alongside **Model B Multi-Quote Comparison**
- [ ] Enforce cancellation/no-show policies and structured invoice/receipt generation

---

## Phase 4 — Live FixSoon Dispatch Tracking & Real-Time Communications
- [ ] Integrate real-time provider location updates for active **FixSoon** jobs (privacy-scoped to active assigned customer only)
- [ ] Wire live push notifications (Web Push + FCM for mobile) for quote alerts, emergency requests, and status milestones
- [ ] Add two-way photo attachments inside authorized request/job message threads

---

## Phase 5 — WorldLeo AI Design Studio Live Generation & Planning Packs
- [ ] Implement **Free AI Inspiration Preview** (room photo upload + style/material direction) using Gemini multimodal generation with safety & cost quotas
- [ ] Implement **CAD $39 Planning Pack** generation (scope checklist, material ranges, indicative 2D floor/site sketch with mandatory licensed-pro verification watermark)

---

## Phase 6 — Native Mobile Apps (Expo + React Native) & App Store Readiness
- [ ] Scaffold **Expo + React Native** client sharing `/api/v1/*` API contracts and TypeScript domain types
- [ ] Configure push notifications (`expo-notifications` + FCM/APNs), deep linking, camera/location just-in-time permissions, and iOS/Android store builds
