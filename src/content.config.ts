import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * One source file → three renderings (web article · checklist PNG · OG card).
 * The frontmatter below is the contract that makes that possible.
 *
 * Trust posture: any visa / legal / benefits claim MUST carry a source in
 * `sources[]` and a `last_verified` date. Those facts are researched fresh at
 * write time and NEVER trusted from model training. The article surfaces
 * "ตรวจสอบล่าสุด: {last_verified}" as a maintenance + trust signal.
 */

const PILLARS = ["ngoen", "visa", "thiao", "mai", "lukkhrueng", "jai"] as const;

const checklistItem = z.object({
  /** Thai text of the step */
  text: z.string(),
  /** Optional one-line clarifier shown under the step */
  note: z.string().optional(),
});

const source = z.object({
  label: z.string(),
  url: z.string().url().optional(),
  /** When this specific fact was checked (YYYY-MM-DD). */
  checked: z.string().optional(),
});

const affiliateSlot = z.enum([
  "wise",
  "travel-insurance",
  "airalo",
  "translation",
  "flights",
]);

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    pillar: z.enum(PILLARS),
    /** Primary Thai title (display) */
    title_th: z.string(),
    /** Optional English mirror title, for the "ส่งให้แฟนอ่าน" version */
    title_en: z.string().optional(),
    /** One-line Thai standfirst shown under the title + used in OG card */
    summary: z.string(),
    /** Pre-written Thai share text: "อ่านอันนี้เด้อ 👇" style */
    share_text: z.string().default("อ่านอันนี้เด้อ 👇"),
    /** The forwardable checklist — also rendered as a tall LINE PNG. */
    checklist: z.array(checklistItem).default([]),
    /** Affiliate cards to surface in this article, in order. */
    affiliate_slots: z.array(affiliateSlot).default([]),
    /** Crisis content is never paywalled. Also blocks any pack CTA. */
    merit: z.boolean().default(false),
    /** Optional premium pack teaser (Gumroad) — hidden when merit=true. */
    pack: z
      .object({
        title: z.string(),
        price_thb: z.number(),
        url: z.string(),
      })
      .optional(),
    /** Sources behind the factual claims. Required for visa/legal/widows. */
    sources: z.array(source).default([]),
    /** Last full fact-check date, YYYY-MM-DD. Surfaced on the page. */
    last_verified: z.string(),
    /** Publish date */
    date: z.coerce.date(),
    /** Hide from listings while drafting */
    draft: z.boolean().default(false),
    /** Related reading */
    related: z.array(reference("articles")).default([]),
    /** Order weight within a pillar (lower = earlier) */
    order: z.number().default(100),
  }),
});

export const collections = { articles };
