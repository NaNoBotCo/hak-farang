# Go-live checklist — ฮักฝรั่ง / hakfarang.net

Everything below is a step only you can do (accounts, money rails). The code is
already wired and **gated** — each feature stays hidden until you flip its flag,
so nothing dead ships in the meantime.

## 1. ตู้บุญ — PromptPay QR  ✅ decided: PromptPay

1. Banking app → PromptPay → "รับเงิน / My QR" → save the QR image.
2. Save it as `public/tubun-promptpay.png`.
3. In `src/data/affiliates.ts` → `TU_BUN`: set `ready: true` and fill
   `promptpayName` (the name donors will see, so they trust it's you).
4. Rebuild. The QR + "ทำบุญเท่าไหร่ก็ได้" appears on every article and /tubun.
5. Update `totalTHB` / `supporters` by hand now and then for the merit counter.

## 2. LINE Official Account  ✅ decided: day 1

1. Create the OA (free) at https://manager.line.biz.
2. Copy your **Basic ID** (e.g. `@hakfarang`) and the **add-friend URL**.
3. In `src/data/line.ts` → `LINE_OA`: fill `basicId` + `addFriendUrl`,
   set `ready: true`. Optional: export the add-friend QR → `public/line-oa-qr.png`.
4. Rebuild. The green "เพิ่มเพื่อนใน LINE" card appears on the home page and
   (compact) on every article.
5. In LINE OA Manager: set up the **auto-reply / rich menu** routing to the top
   pages, and use **broadcast** to push each new article.

## 3. First premium pack — Schengen  ✅ BUILT

- **Product file is ready:** `packs/schengen/แพ็กวีซ่าเชงเก้น-hakfarang.zip`
  (7 files: branded guide in Word+PDF, 4 fill-in letter/itinerary templates,
  a Thai Read Me). Regenerate any time with:
  `cd packs/schengen && node build_pack.cjs` then re-zip (see that script's header).
- **Remaining (yours):** create the Gumroad product (฿299, ends in ๙), upload the
  zip, then put the Gumroad URL in the Schengen article's frontmatter `pack.url`
  (`src/content/articles/schengen-sponsor.md`), replacing `#pack-schengen`,
  and `npm run build` + deploy.

## 4. Affiliates  ✅ decided: existing entity

Apply under your existing business entity. As each is approved, drop the tracking
URL into `src/data/affiliates.ts` and set that offer's `live: true`:

- **Wise** (money transfer) — used on the remittance article. Highest intent.
- **Travel insurance** (SafetyWing / Luma / AXA) — Schengen + first-flight articles.
- **Airalo** (eSIM) — first-flight article.
- **Translation service** — document-chain content.

Disclosure text is already baked into every card in Thai.

## 5. Deploy — Cloudflare Pages

1. Push the repo to a private git remote (Cloudflare Pages can also deploy from a
   direct upload of `dist/`).
2. Pages project: build command `npm run build`, output dir `dist`.
3. Add the custom domain **hakfarang.net** in Pages → DNS.
4. `SITE` in `astro.config.mjs` is already `https://hakfarang.net`.
5. Ship on the next auspicious Thursday (วันครู) or วันพระ.

## 6. Analytics (optional, no cookie banner)

Add a Plausible or Cloudflare Web Analytics `<script>` to `src/layouts/Base.astro`
`<head>`. Both are cookieless, so no consent clutter.
