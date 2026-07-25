/**
 * LINE Official Account — the retention channel (the website is the library,
 * LINE OA is where new articles get broadcast + an auto-reply menu routes to
 * the top pages).
 *
 * To go live (day 1):
 *   1. Create the OA at https://manager.line.biz (free tier).
 *   2. Copy your Basic ID (looks like "@hakfarang") and the add-friend URL.
 *   3. Fill `basicId` + `addFriendUrl` below and set `ready: true`.
 *   4. Optional: export the OA's add-friend QR → public/line-oa-qr.png.
 * See SETUP.md for the broadcast + auto-reply-menu checklist.
 */
export const LINE_OA = {
  ready: false,
  basicId: "@hakfarang", // placeholder — replace with your real Basic ID
  addFriendUrl: "https://line.me/R/ti/p/@hakfarang", // placeholder
  qr: "/line-oa-qr.png", // optional add-friend QR image
};
