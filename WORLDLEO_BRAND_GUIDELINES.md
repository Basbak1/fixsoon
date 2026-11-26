# WorldLeo — Brand Guidelines (Stage 2 Approved Identity)

## 1. Corporate Brand Architecture

| Level | Name | Positioning & Role |
| :--- | :--- | :--- |
| **Parent Brand** | **WorldLeo** | Sole corporate marketplace identity. Tagline: *"Your Home. Your Vehicle. One Trusted Place for Help."* |
| **Division 1** | **WorldLeo Home** | Home repairs, renovations, skilled trades, property improvements, and **AI Design Studio**. |
| **Division 2** | **WorldLeo Auto** | Mobile mechanics, vehicle repairs, tire and battery services, maintenance, and **FixSoon**. |
| **Signature Feature (Home)** | **AI Design Studio** | Concept visualization, preliminary project scopes, and contractor quote preparation. Assisted by **Leo** (`LeoAmbassadorAvatar`). |
| **Signature Feature (Auto)** | **FixSoon** | Rapid roadside assistance nested exclusively inside **WorldLeo Auto** (`WorldLeo Auto → FixSoon`). Never promoted above WorldLeo in header or footer. |

---

## 2. Corporate Symbol & Asset System

- **Approved Mark (`WorldLeoSymbol` & `/public/icon.svg`):**
  - Flat, scalable geometric construction inspired by the attached `/public/assets/aistudio/Regal_Gold_Lion_W_Emblem_6ac2f08b.png` emblem: a **dominant bold folded W**, a **tapered sweeping orbital crescent**, and a **small calm regal side-profile Leo head with swept-back flowing mane** positioned at the upper-right orbit endpoint.
  - Zero metallic bevels, drop shadows, gloss, or decorative clutter; architectural overlap separation via SVG mask cutout.
  - **Small-Size Legibility Rule:** At icon sizes `<= 22px`, fold facets and fine facial details simplify cleanly to bold silhouette + minimal mane form (`simplified` threshold built into `WorldLeoSymbol`).
- **Wordmark Typography (`WorldLeoLogo`):**
  - Always written **WorldLeo** (never WoLeo, WLoe, or FixSoon as parent).
  - **World** renders in `#F6F2E8` (on dark surfaces) or `#171B19` (on light surfaces).
  - **Leo** renders in `#C6A45B` (or monochrome currentColor in monochrome mode).
- **Available Variants:** `horizontal`, `compact` (mobile nav), `symbol` (favicon/app icon), across tones `auto`, `light`, `dark`, and `monochrome`.

---

## 3. WorldLeo Verified Provider Badge (Retained Shield)

- The shield + checkmark emblem is retired as the corporate logo and retained **exclusively** as `WorldLeoVerifiedBadge`.
- **Strict Gating Rule (`isWorldLeoVerified`):** Renders **only** when `business_verified === true && insurance_verified === true && profile_reviewed === true`. Never displayed on unverified or pending providers.

---

## 4. Approved Colour Palette & Semantic Tokens (`src/index.css`)

| Role | Token | Hex |
| :--- | :--- | :--- |
| Deep Bottle Green (Primary Brand / Light CTA) | `--wl-green-deep` | `#063B2B` |
| Dark Forest Green (Dark Canvas / Deep Header) | `--wl-green-forest` | `#071E17` |
| Secondary Green (Hover / Borders / Surfaces) | `--wl-green-secondary` | `#145443` |
| Warm Muted Gold (Primary Accent / Dark CTA) | `--wl-gold` | `#C6A45B` |
| Highlight Gold (Focus / Hover) | `--wl-gold-highlight` | `#D8B66F` |
| Deep Gold (Light Mode Gold Accent) | `--wl-gold-deep` | `#9F7B37` |
| Warm Ivory (Dark Text / Light Tint) | `--wl-ivory` | `#F6F2E8` |
| Soft White (Light Mode Canvas) | `--wl-soft-white` | `#F8F7F2` |
| Charcoal (Light Mode Primary Text) | `--wl-charcoal` | `#171B19` |
| Secondary Grey (Muted Labels) | `--wl-grey` | `#6D756F` |

---

## 5. Voice & Copy Standards

- Plain-language Canadian English, calm authority, zero hype or fabricated counters.
- Clear distinction between **Demo Profile**, **Pending Review**, and **WorldLeo Verified** status.
- Mandatory verification disclaimer on all AI Design Studio preview outputs.
