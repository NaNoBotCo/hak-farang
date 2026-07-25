import type { APIRoute } from "astro";
import { renderOgCard } from "@/lib/og";

/** Default OG card for the homepage and any page without its own. */
export const GET: APIRoute = async () => {
  const png = await renderOgCard({
    title: "เรื่องเงิน วีซ่า เที่ยว และชีวิตกับแฟนฝรั่ง",
    summary: "พี่สาวที่ผ่านมาก่อน คอยบอกให้ ทุกอย่างเป็นภาษาเฮา อ่านฟรี ไม่ต้องอาย",
    pillar: "jai",
  });
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
