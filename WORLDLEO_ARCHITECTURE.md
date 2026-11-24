# WorldLeo — System Architecture (Phase 1 Audit & Foundation)

**Last Updated:** Phase 1 Foundation  
**Runtime Stack:** React 19 + TypeScript 7 + Vite 8 + Tailwind CSS v4 + Express (`server.ts`, port `3000`)

---

## 1. Current Repository Topology (Verified Audit)

### Frontend (`/src`)
| Module | Responsibility | Status |
| :--- | :--- | :--- |
| `src/App.tsx` | Client-side router (`window.history.pushState`), catalog bootstrap, offline & Maps quota banners | Active & extended for WorldLeo routes |
| `src/context/ThemeContext.tsx` | `light` / `dark` / `system` theme controller (`worldleo_theme` + `fixsoon_theme` migration) | Active |
| `src/context/AuthContext.tsx` | Session state (`login`, `register`, `loginWithGoogle`, `logout`, `refreshMe`) | Active (uses interim `localStorage` token; cookie migration planned Phase 2) |
| `src/components/WorldLeoLogo.tsx` | Geometric lion crest SVG + `WorldLeo` wordmark | Added in Phase 1 |
| `src/components/FixSoonLogo.tsx` | Compact `FixSoon` sub-brand emblem with speed cue | Updated in Phase 1 |
| `src/components/Header.tsx` & `Footer.tsx` | WorldLeo dual-vertical navigation, urgent FixSoon link, Ontario links, legal links, theme switcher | Updated in Phase 1 |
| `src/components/Breadcrumbs.tsx` & `SeoHead.tsx` | Dynamic `<title>`, OpenGraph, canonical tags, `BreadcrumbList` & page JSON-LD | Updated for WorldLeo routes |
| `src/components/TrustAndVerification.tsx` | Verification checklist display & vetting pillars | Updated to WorldLeo |
| `src/components/CoverageMap.tsx` & `GroundingAdvisor.tsx` | Google Maps visualization & Gemini Search/Maps grounding UI | Existing (requires API keys in runtime env) |
| `src/components/NotificationBell.tsx` | REST notification list + Server-Sent Events (`/api/notifications/stream`) | Existing |
| `src/pages/HomePage.tsx` | WorldLeo dual-entry homepage (Home vs Auto + FixSoon urgent path) | Rebranded in Phase 1 |
| `src/pages/WorldLeoPages.tsx` | `/home`, `/home/ai-design`, `/home/kitchen-renovation`, `/home/bathroom-renovation`, `/home/backyard-design`, `/auto`, `/auto/fixsoon`, `/contact`, `/privacy`, `/terms` | Added in Phase 1 |
| `src/pages/DirectoryPage.tsx` & `ProviderProfilePage.tsx` | Searchable directory (distance, price, availability filters) & SEO provider profile pages | Existing & restyled |
| `src/pages/RequestFlowPage.tsx` | Plain-language problem classifier, dynamic category fields, marketplace vs direct flow | Existing & supports `?urgency=emergency` |
| `src/pages/CustomerDashboard.tsx` & `ProviderDashboard.tsx` | Quote comparison, job timeline, messaging thread, reviews, disputes, emergency prioritization | Existing & restyled |
| `src/pages/ProviderOnboardingPage.tsx` & `AdminDashboard.tsx` | Pro registration, admin verification queue, category creation, dispute resolution, audit log | Existing & restyled |
| `src/pages/PublicInfoPages.tsx` | `/services`, `/categories/:slug`, `/services/:slug`, `/locations/:city/:service`, `/coverage-areas`, `/how-it-works`, `/for-providers`, `/for-professionals`, `/about`, `/android-blueprint` | Existing & extended |
| `src/lib/firebase.ts` | Client Firebase Auth (`GoogleAuthProvider`) & optional Firestore mirroring | Active (`firebase-applet-config.json`) |

### Backend (`/server.ts` & `/server/*`)
| Module | Responsibility | Notes |
| :--- | :--- | :--- |
| `server.ts` | Express API server + Vite middleware (dev) / `dist` static serving (prod) + `robots.txt` + `sitemap.xml` | Port `3000`, HTTP + Vite HMR WS support |
| `server/db.ts` | Interim local JSON file persistence (`data/fixsoon.json`) with seeded demo data | **Interim dev store only — Phase 2 DB migration required** |
| `server/auth.ts` | `scrypt` password hashing & HMAC-SHA256 signed session tokens | Ephemeral `crypto.randomBytes(32)` fallback if `SESSION_SECRET` unset |
| `server/matching.ts` | Plain-language keyword classifier & city/category/availability match scoring | Active |
| `server/notifications.ts` | In-memory + DB notification store + active SSE stream dispatcher | Active |

---

## 2. API Surface & Mobile Readiness (`/api/*` & `/api/v1/*`)

In Phase 1, all existing `/api/*` endpoints remain active for backward compatibility, and `/api/v1/*` aliases are mounted alongside new mobile-readiness endpoints so future **Expo + React Native** clients can target a stable versioned contract:

| Endpoint | Method | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/v1/health` | `GET` | Public | Server liveness & storage mode indicator |
| `/api/v1/config` | `GET` | Public | Feature flags (`livePayments`, `realGpsTracking`, `aiDesignGeneration`, `paidPlanningPacks`), `planningPackPriceCad: 39`, brand/vertical metadata |
| `/api/catalog` & `/api/v1/catalog` | `GET` | Public | Active categories, subcategories, GTA/Hamilton/Niagara locations |
| `/api/faqs` & `/api/v1/faqs` | `GET` | Public | Dynamic grounded FAQs |
| `/api/classify-problem` & `/api/v1/classify-problem` | `POST` | Public | Plain-language symptom -> category/subcategory classification |
| `/api/providers` & `/api/v1/providers` | `GET` | Public | Approved provider directory with filtering |
| `/api/providers/:slug` & `/api/v1/providers/:slug` | `GET` | Public | Single approved provider + reviews + services |
| `/api/auth/*` & `/api/v1/auth/*` | `POST`/`GET` | Public / Bearer | Register, login, Firebase sync, `/me` |
| `/api/requests/*` & `/api/v1/requests/*` | `POST`/`GET` | Bearer | Create request, convert direct -> marketplace, read/post authorized thread messages |
| `/api/customer/*` & `/api/v1/customer/*` | `GET`/`POST` | Bearer | Customer dashboard, saved providers |
| `/api/quotes/:quoteId/accept` & `/api/v1/quotes/:quoteId/accept` | `POST` | Bearer | Customer accepts quote -> creates Job |
| `/api/provider/*` & `/api/v1/provider/*` | `GET`/`POST` | Bearer | Onboarding, dashboard, availability, quotes, decline, job status |
| `/api/admin/*` & `/api/v1/admin/*` | `GET`/`POST` | Admin Bearer | Overview, provider verification, category management, dispute resolution |

---

## 3. Known Architectural Gaps (Documented for Phase 2+)

1. **Flat JSON Persistence (`data/fixsoon.json`):** `server/db.ts` reads/writes an entire JSON file in memory (`fs.writeFileSync` + rename). While acceptable for single-instance local/demo preview, it is **not safe** for multi-instance Cloud Run scaling or concurrent financial transactions.
2. **Dual Client/Server Persistence Split:** `src/lib/firebase.ts` mirrors some Google Sign-In/request/review events client-side to Firestore while `server.ts` writes everything to `data/fixsoon.json`. Phase 2 will unify all authoritative state under server-verified Firestore or Cloud SQL.
3. **Firebase Token Verification:** `/api/auth/firebase` currently receives client claims without server-side Firebase Admin `verifyIdToken()`. Phase 1 restricts unverified Firebase email matching so it cannot hijack `admin` or password-created accounts; Phase 2 must add full Firebase Admin token verification.
4. **Live Integrations Deferred:** Stripe payments, real-time FixSoon driver GPS telemetry, live FCM push credentials, and paid Gemini image generation for AI Design Studio remain disabled (`featureFlags.* = false`) until explicitly approved in later phases.
