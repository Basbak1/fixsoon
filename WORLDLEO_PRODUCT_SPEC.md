# WorldLeo — Product Specification (Stage 2 Baseline)

**Document Status:** Stage 2 — Batches 2.1 & 2.2 Baseline (Living Specification)  
**Target Region:** Ontario, Canada — Greater Toronto Area (GTA), Greater Hamilton Area, and Niagara Region  
**Platform Identity:** **WorldLeo** (Parent Marketplace) · **WorldLeo Home** · **WorldLeo Auto** · **FixSoon** (Urgent Roadside Feature)

---

## 1. Product Vision & Brand Hierarchy

WorldLeo is a professionally managed Canadian marketplace connecting customers with independent Home and Automotive service providers:

> **"Your Home. Your Vehicle. One Trusted Place for Help."**

WorldLeo unifies two specialized divisions under one website, database, authentication system, verification standard, and customer experience:

1. **WorldLeo** (Parent Brand)
   - Forest Green (`#063B2B` / `#071E17`) and Warm Muted Gold (`#C6A45B`) corporate identity anchored by the **bold W + smooth orbit + calm friendly Leo head** symbol.
   - Owns account identity, customer/provider workspaces, verification standards, privacy protection, and future marketplace governance.
2. **WorldLeo Home** (`/home`, `/home/repairs`, `/home/renovations`)
   - Covers home repairs, renovations, skilled trades, and property improvements.
   - Includes **AI Design Studio** (`/home/ai-design`) featuring brand ambassador **Leo** and curated entry points (`/home/kitchen-renovation`, `/home/bathroom-renovation`, `/home/backyard-design`).
3. **WorldLeo Auto** (`/auto`)
   - Covers mobile mechanics, vehicle repairs, tire and battery services, maintenance, and **FixSoon** rapid roadside assistance.
4. **FixSoon** (`/auto/fixsoon`)
   - Signature rapid roadside-assistance feature nested inside **WorldLeo Auto** (`WorldLeo Auto → FixSoon`).
   - Never promoted above **WorldLeo** as a competing corporate header/footer brand.

---

## 2. Two-Sided Operating Models

1. **Direct Request (Model A+ Direction):** Customers can request a specific verified professional directly (`/professionals/:slug` -> `/request-service?provider=...`) or request urgent roadside support under FixSoon, with one-click fallback to the general marketplace if needed.
2. **Multi-Quote Marketplace (Model B):** Customers submit a structured request selecting **WorldLeo Home** or **WorldLeo Auto** at Step 1 (`/request-service`). Exact street address and phone stay masked until a quote is accepted and assigned.

---

## 3. WorldLeo AI Design Studio (`/home/ai-design`)

Planned two-tier experience for **WorldLeo Home** planning:
- **Free AI Inspiration Preview** and **Planning Pack (CAD $39, admin-configurable)** remain labeled **Development Preview** in Stage 2 (live image generation and live checkout are excluded from Stage 2).
- **Mandatory Engineering Disclaimer:** Any AI-assisted visual concept or preliminary 2D spatial layout is for planning discussion only and **must be verified on-site by a qualified contractor, designer, or licensed engineer** before ordering materials, applying for permits, or starting construction.

---

## 4. Trust, Verification & Honest Metrics Policy

- **No Fabricated Numbers:** Zero invented customer counts, fake completion counters, or synthetic reviews.
- **Demo Labeling:** Seeded profiles (`Marcus Miller`, `Sarah Jenkins`, `David Patel`) are explicitly labeled **Demo Profile**.
- **WorldLeo Verified Badge:** The retained shield+checkmark emblem (`WorldLeoVerifiedBadge`) renders ONLY when `business_verified && insurance_verified && profile_reviewed` are all verified.
- **No Live Payments in Stage 2:** Progressive fee schedules are visible strictly for Operations/Finance planning (`AdminDashboard.tsx`); live payment collection remains disabled.
