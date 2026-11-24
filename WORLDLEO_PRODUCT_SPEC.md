# WorldLeo — Product Specification (Phase 1)

**Document Status:** Phase 1 Baseline (Living Specification)  
**Target Region:** Ontario, Canada — Greater Toronto Area (GTA), Greater Hamilton Area, and Niagara Region  
**Platform Identity:** **WorldLeo** (Parent Marketplace) · **WorldLeo Home** · **WorldLeo Auto** · **FixSoon** (Urgent Roadside Sub-Brand)

---

## 1. Product Vision & Brand Hierarchy

WorldLeo is a managed two-sided service marketplace built around one promise:

> **"WorldLeo — Find professionals. Plan projects. Get things done."**

Instead of forcing customers to navigate separate websites for home improvements and vehicle emergencies, WorldLeo unifies two specialized verticals under one account, one verification framework, and one service assurance model:

1. **WorldLeo** (Parent Brand)
   - Neutral, elevated identity (Luxury Black, Refined Gold, Warm Off-White, Neutral Grey).
   - Owns account identity, customer/provider workspaces, verification standards, privacy protection, and future payment/dispatch governance.
2. **WorldLeo Home** (`/home`)
   - Covers home repairs, renovations, exterior improvements, and project planning.
   - Includes **WorldLeo AI Design Studio** (`/home/ai-design`) and curated project entry points (`/home/kitchen-renovation`, `/home/bathroom-renovation`, `/home/backyard-design`).
   - *Phase 1 Status:* Landing pages and AI Design Studio preview are live in Development Preview; Home contractor categories are staged for Phase 2–4 activation.
3. **WorldLeo Auto** (`/auto`)
   - Covers mobile mechanics, flat tire specialists (cars, trucks, Bobcats/skid steers, trailers), battery boosts, battery replacement, and vehicle/equipment diagnostics.
   - *Phase 1 Status:* Core marketplace request, matching, quoting, and job-tracking workflow is operational using demo/local data.
4. **FixSoon** (`/auto/fixsoon`)
   - Compact rapid-response sub-brand inside **WorldLeo Auto** for urgent roadside breakdowns and emergencies.
   - Always spelled **FixSoon** (one word, capital `F` and `S`).
   - Primary urgent action: **Get Help Now**.

---

## 2. Two-Sided Operating Models

WorldLeo supports two transparent request-and-fulfillment modes so customers can balance speed against price comparison:

### Model A+ — Direct Dispatch / Managed Platform Access (Planned Full Automation in Phase 3)
- Designed for urgent **FixSoon** roadside requests or customers selecting a specific verified professional directly.
- In Phase 1, customers can submit a **Direct Request** to an approved provider from the directory (`/professionals/:slug` -> `/request?provider=...`) and convert to a general marketplace request in one click if the provider is unavailable.
- Full automated platform pricing, escrow checkout, and live GPS dispatch tracking are planned for Phases 3–4 and marked clearly as **Development Preview**.

### Model B — Multi-Quote Marketplace
- Customer submits a structured request describing the issue in plain language or selecting a category (`/request`).
- Matched, approved professionals in the customer's Ontario service area receive the request with **exact street address and phone masked**.
- Professionals submit itemized written quotes (service fee, line-item parts, ETA, duration, warranty terms).
- Customer compares quotes side by side and accepts one; only then is the exact service address shared with the assigned professional.

---

## 3. WorldLeo AI Design Studio (`/home/ai-design`)

Planned two-tier experience for **WorldLeo Home** planning:
- **Free AI Inspiration Preview:** Concept visual direction and initial scope ideas from room photos and dimensions *(Development Preview — live image generation not active in Phase 1)*.
- **Planning Pack (CAD $39, admin-configurable):** Structured concept pack with preliminary scope checklist and indicative 2D spatial layout intended to help customers brief contractors cleanly *(Development Preview — live payments & PDF pack generation not active in Phase 1)*.
- **Mandatory Engineering Disclaimer:** Any AI-assisted visual concept or preliminary 2D spatial layout is for planning discussion only and **must be verified on-site by a qualified contractor, designer, or licensed engineer** before ordering materials, applying for permits, or starting construction.

---

## 4. Trust, Verification & Honest Metrics Policy

WorldLeo enforces strict honesty across every public surface:
- **No Fabricated Numbers:** Zero invented customer counts, fake completion counters, synthetic 5-star badges, or unverified "instant arrival" promises.
- **Demo Labeling:** Seeded profiles (`Marcus Miller`, `Sarah Jenkins`, `David Patel`) and demo accounts are explicitly labeled **Demo Profile** or **Demo Environment**.
- **Separated Credentials:** Self-reported bios and years of experience are separated from operations-reviewed checks (`email_verified`, `phone_verified`, `business_verified`, `insurance_verified`, `license_verified`, `profile_reviewed`).
- **Verified Job Reviews:** Reviews are restricted to completed jobs on the platform; seeded sample reviews are clearly contextualized with demo profiles.

---

## 5. Ontario Geographic Scope (Phase 1)

Active seeded municipalities along the QEW, 401, 403, 407, and 400-series corridors:
- **Greater Toronto Area (GTA):** Toronto, Mississauga, Brampton, Markham, Vaughan, Oakville
- **Greater Hamilton Area:** Burlington, Hamilton
- **Niagara Region:** Grimsby, St. Catharines, Niagara Falls, Welland

---

## 6. Supported Channels & Client Roadmap

- **Web Application (Phase 1 Active):** Responsive React + Vite SPA served by Express on port 3000 with PWA installability and Light/Dark/System themes.
- **Mobile Clients (Planned — Expo + React Native):** Android and iOS native experiences will share versioned REST contracts (`/api/v1/*`) exposed by the backend. Native Expo directories are intentionally deferred until Phase 5 after core backend persistence and auth hardening are completed.
