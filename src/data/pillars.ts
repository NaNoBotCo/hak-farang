/**
 * Pillar registry — the single source of truth for navigation, colours,
 * and the emic Thai labels. Article frontmatter references these by `id`.
 *
 * Voice note: big sister, warm-informal, rao/jao/na register. Every pillar
 * treats her as the competent party managing a complicated cross-border life.
 */

export type PillarId = "ngoen" | "visa" | "thiao" | "mai" | "lukkhrueng" | "jai";

export interface Pillar {
  id: PillarId;
  /** Thai label as shown in nav */
  label: string;
  /** Roman gloss for the farang-facing mirror + slugs */
  roman: string;
  /** One-line promise, in her language */
  tagline: string;
  /** Which token family theming this pillar leans on */
  accent: "marigold" | "naga" | "lotus";
  emoji: string;
  /** Crisis pillars are never paywalled (merit rule). */
  merit: boolean;
}

export const PILLARS: Pillar[] = [
  {
    id: "ngoen",
    label: "เงิน",
    roman: "money",
    tagline: "เรื่องเงินที่บ่มีไผบอกเฮา — ส่งเงินให้แม่ โอนเงิน สินสมรส",
    accent: "marigold",
    emoji: "💰",
    merit: false,
  },
  {
    id: "visa",
    label: "วีซ่า",
    roman: "visa",
    tagline: "ขอวีซ่า เขาสปอนเซอร์ ทำไมโดน reject — แล้วสิทธิ์ของเฮา",
    accent: "naga",
    emoji: "🛂",
    merit: false,
  },
  {
    id: "thiao",
    label: "เที่ยว",
    roman: "travel",
    tagline: "ครั้งแรกขึ้นเครื่อง เมืองหนาว ตม.ถามอะไร — ไปให้รอด",
    accent: "marigold",
    emoji: "✈️",
    merit: false,
  },
  {
    id: "mai",
    label: "ม่าย",
    roman: "widows",
    tagline: "ถ้าเขาเสีย — สิทธิ์และเงินที่เฮาควรได้ ที่บ่มีไผบอก",
    accent: "naga",
    emoji: "🕯️",
    merit: true,
  },
  {
    id: "lukkhrueng",
    label: "ลูกครึ่ง",
    roman: "kids",
    tagline: "สองสัญชาติ จดรับรองบุตร โรงเรียน เกณฑ์ทหาร — เพื่อลูกเฮา",
    accent: "lotus",
    emoji: "🧒",
    merit: false,
  },
  {
    id: "jai",
    label: "ใจ",
    roman: "heart",
    tagline: "เรื่องหัวใจข้ามวัฒนธรรม — หัวเราะได้ ไม่ต้องอาย",
    accent: "lotus",
    emoji: "💛",
    merit: false,
  },
];

export const PILLAR_BY_ID: Record<PillarId, Pillar> = Object.fromEntries(
  PILLARS.map((p) => [p.id, p]),
) as Record<PillarId, Pillar>;

/** Tailwind-ready accent classes per pillar, so components stay declarative. */
export const ACCENT_CLASSES: Record<
  Pillar["accent"],
  { text: string; bg: string; ring: string; chipBg: string; chipText: string }
> = {
  marigold: {
    text: "text-marigold-600",
    bg: "bg-marigold-400",
    ring: "ring-marigold-300",
    chipBg: "bg-marigold-100",
    chipText: "text-marigold-800",
  },
  naga: {
    text: "text-naga-600",
    bg: "bg-naga-500",
    ring: "ring-naga-300",
    chipBg: "bg-naga-100",
    chipText: "text-naga-800",
  },
  lotus: {
    text: "text-lotus-500",
    bg: "bg-lotus-400",
    ring: "ring-lotus-300",
    chipBg: "bg-lotus-200",
    chipText: "text-naga-800",
  },
};

/** Rotating footer blessing — one line, auspicious. */
export const BLESSINGS: string[] = [
  "ขอให้เดินทางปลอดภัย เงินทองไหลมา ใจสงบเย็น 🙏",
  "ขอให้เรื่องยาก ๆ ผ่านไปง่าย ๆ นะเจ้า",
  "ขอให้ได้ในสิ่งที่ควรได้ ทุกบาททุกสิทธิ์",
  "เก่งแล้วเด้อ ที่ดูแลทุกอย่างได้ขนาดนี้",
  "ขอให้มีคนดี ๆ อยู่ข้าง ๆ เสมอ",
  "ขอให้ลูกหลานเจริญ ครอบครัวเป็นสุข",
  "ทำบุญวันนี้ เผื่อแผ่ถึงน้องคนต่อไป",
  "ขอให้ใจดี ๆ ของเฮา ได้รับสิ่งดี ๆ ตอบแทน",
  "ขอให้ทุกก้าว ก้าวหน้า ๙ ทิศ",
];
