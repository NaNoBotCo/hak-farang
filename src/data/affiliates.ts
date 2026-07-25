/**
 * Affiliate slot registry. Articles reference these by `slot` id in their
 * `affiliate_slots` frontmatter; the AffiliateSlot component renders the card.
 *
 * Disclosure is baked in and shown in Thai on every card:
 *   "ลิงก์นี้เฮาได้ค่าน้ำใจนิดหน่อย ราคาเจ้าเท่าเดิมเน้อ"
 *
 * URLs below are PLACEHOLDERS until the real affiliate accounts are approved
 * (see README → decisions). Swap `url` when the tracking links exist.
 */

export type AffiliateSlotId =
  | "wise"
  | "travel-insurance"
  | "airalo"
  | "translation"
  | "flights";

export interface AffiliateOffer {
  id: AffiliateSlotId;
  title: string;
  blurb: string;
  cta: string;
  emoji: string;
  /** Replace with the approved tracking link. */
  url: string;
  /** Set false until the account is live, to hide the card in build. */
  live: boolean;
}

export const AFFILIATES: Record<AffiliateSlotId, AffiliateOffer> = {
  wise: {
    id: "wise",
    title: "โอนเงินด้วย Wise",
    blurb: "เรตดีกว่าธนาคาร ค่าธรรมเนียมโปร่งใส เห็นก่อนโอนว่าปลายทางได้เท่าไหร่",
    cta: "ดูเรตวันนี้",
    emoji: "💸",
    url: "#wise", // TODO: Wise affiliate tracking link
    live: false,
  },
  "travel-insurance": {
    id: "travel-insurance",
    title: "ประกันเดินทาง",
    blurb: "ไปเมืองหนาว/ยุโรป Schengen ต้องมีประกัน — เทียบแผนที่คุ้มก่อนซื้อ",
    cta: "เทียบแผนประกัน",
    emoji: "🛡️",
    url: "#insurance", // TODO: SafetyWing / Luma / AXA link
    live: false,
  },
  airalo: {
    id: "airalo",
    title: "เน็ตมือถือต่างประเทศ (eSIM)",
    blurb: "ลงเครื่องปุ๊บ มีเน็ตปั๊บ ไม่ต้องหาซิมที่สนามบิน",
    cta: "ดู eSIM ประเทศปลายทาง",
    emoji: "📶",
    url: "#airalo", // TODO: Airalo affiliate link
    live: false,
  },
  translation: {
    id: "translation",
    title: "แปลเอกสารรับรอง",
    blurb: "แปลสูติบัตร ทะเบียนสมรส ใบรับรอง ให้ผ่านสถานทูต ไม่ต้องแปลซ้ำ",
    cta: "หาบริการแปล",
    emoji: "📄",
    url: "#translation", // TODO: translation-service affiliate link
    live: false,
  },
  flights: {
    id: "flights",
    title: "จองตั๋วเครื่องบิน",
    blurb: "เทียบราคาหลายสายการบิน หาวันที่ถูกที่สุด",
    cta: "ค้นหาเที่ยวบิน",
    emoji: "🎫",
    url: "#flights", // TODO: flights affiliate link
    live: false,
  },
};

/**
 * ตู้บุญ — merit box. Processor = PromptPay QR (zero fees, Thai-native).
 *
 * To go live:
 *   1. Open your banking app → PromptPay → "รับเงิน / My QR" → save/share the QR image.
 *   2. Drop it in `public/tubun-promptpay.png`.
 *   3. Set `ready: true` and fill `promptpayName`.
 * PromptPay QR carries no fixed amount, so donors give whatever they like.
 * `totalTHB` / `supporters` are the public merit counter — update by hand.
 */
export const TU_BUN = {
  ready: false,
  /** Path to the PromptPay QR you exported from your bank app. */
  qr: "/tubun-promptpay.png",
  /** Shown under the QR so donors know it's the right account. */
  promptpayName: "",
  /** Suggested amounts, ending in ๙ (auspicious). Any amount is fine. */
  suggestTHB: [9, 99, 199],
  totalTHB: 0,
  supporters: 0,
};
