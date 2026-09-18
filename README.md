# ฮักฝรั่ง · hakfarang.net

พี่สาวที่ผ่านมาก่อน — a Thai-first, mobile-first, share-first guide to money,
visas, travel, and life with a farang partner. Warm big-sister voice, zero
shame, knowledge free (merit rule), convenience paid.

**Domain:** hakfarang.net (registered 2026-07-25)
**Stack:** Astro 5 (static) · Tailwind v4 · React islands · satori/resvg OG cards
**Hosting target:** Cloudflare Pages (free tier, fast in TH)

---

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/  (also generates every OG card)
npm run preview    # serve the built dist/
```

## How the site is put together

```
src/
  content.config.ts        # article frontmatter schema (drives web + checklist + OG)
  content/articles/*.md     # one source file → three renderings
  data/pillars.ts           # pillar registry — single source of truth for nav/colour/labels
  data/affiliates.ts        # affiliate slot registry + ตู้บุญ config (URLs are placeholders)
  layouts/                  # Base (head/OG) + Article (the full article shell)
  components/               # Header, Footer, Checklist (island), ShareBar, AffiliateSlot,
                            # TuBun, PullCard, ArticleCard, motifs/ (naga, malai, lotus)
  lib/og.ts                 # satori → resvg OG-card generator
  pages/
    index.astro             # home (hero + pillar grid + latest 9)
    [pillar]/index.astro     # pillar landing
    [pillar]/[slug].astro    # article
    og/[slug].png.ts         # per-article OG image (build-time)
    404.astro                # lost-farang page
```

### Pillars (routes use the roman gloss)

| id | Thai | route | notes |
|----|------|-------|-------|
| ngoen | เงิน | /money | |
| visa | วีซ่า | /visa | |
| thiao | เที่ยว | /travel | |
| mai | ม่าย | /widows | crisis content — `merit: true`, never paywalled |
| lukkhrueng | ลูกครึ่ง | /kids | |
| jai | ใจ | /heart | the sharing engine |

## Adding an article

Drop a `.md` in `src/content/articles/`. Required frontmatter: `pillar`,
`title_th`, `summary`, `last_verified`, `date`. Optional: `checklist[]`,
`affiliate_slots[]`, `sources[]`, `pack`, `merit`, `title_en`, `order`.

**Trust rule:** every visa/legal/benefits claim needs a `sources[]` entry with a
`checked` date. These facts are researched fresh at write time and never trusted
from model memory. The page shows "ตรวจสอบล่าสุด: {last_verified}".

**Merit rule:** set `merit: true` on crisis content (death procedures, benefit
eligibility, abuse-exit). It shows the "อ่านฟรีเสมอ" badge and suppresses any
premium-pack CTA.

## Launch 9 (built)

2 money · 2 visa · 2 widows · 1 travel · 1 ลูกครึ่ง · 1 ใจ — all facts dated
2026-07-25 with sources in frontmatter. The visa-dependency / abuse-exit page is
`merit: true` and links real DV hotlines (US 1-800-799-7233, UK 0808 2000 247).

## Deploy to Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Point `hakfarang.net` at the Pages project; set `SITE` in `astro.config.mjs`
  is already `https://hakfarang.net` (used for canonical + absolute OG URLs).

---

## Decisions for NaN — status

1. **Name / domain** — ✅ **ฮักฝรั่ง / hakfarang.net** (bought 2026-07-25).
2. **Affiliate accounts** — ⏳ pending. Placeholders live in `src/data/affiliates.ts`
   (`live: false` hides each card until a real tracking URL is set). Apply under
   existing entity or new — your call.
3. **LINE OA at launch or phase 2?** — ⏳ pending. Share buttons already deep-link
   to LINE; OA broadcast is a separate setup (recommend phase 2 unless you want it
   day 1).
4. **First premium pack country** — ⏳ pending. Schengen pack teaser is wired on the
   Schengen article (฿299, `#pack-schengen` placeholder). Swap for US if you prefer
   biggest-spend over biggest-pain.
5. **ตู้บุญ processor** — ⏳ pending. `TU_BUN.url` in `src/data/affiliates.ts` is a
   placeholder. PromptPay QR = zero fees + Thai-native (recommended for TH audience);
   Ko-fi/Stripe = easier running total. Can offer both.

## Still to build (post-launch backlog)

- English mirror (`/en/{slug}`) with "ส่งหน้านี้ให้แฟนอ่าน" — schema field `title_en`
  is already in place.
- Downloadable tall checklist PNG (1080×~2400) for LINE forwarding.
- More country visa packs; "ทำไมโดน reject"; cold-climate survival; เกณฑ์ทหาร;
  Thai intestacy / มรดก; SSA survivor deep-dive.
- Plausible/Cloudflare analytics snippet.


## Licence

Records, prose and pages: CC BY-SA 4.0. Code: AGPL-3.0-or-later. Anything
carried in from elsewhere keeps its own terms — see [LICENSE](LICENSE).

**Commercial licence.** If share-alike doesn't fit your use — a corpus, a
product, a model — a commercial licence is available.
[Open an issue](https://github.com/NaNoBotCo/hak-farang/issues) and say what you need.
