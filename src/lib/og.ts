import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { PillarId } from "@/data/pillars";
import { PILLAR_BY_ID } from "@/data/pillars";

/**
 * Build-time OG card generator. One gold card per article, designed to look
 * good in a Facebook group feed (the real homepage). satori → SVG → PNG.
 */

const FONT_DIR = (pkg: string) =>
  join(process.cwd(), "node_modules", "@fontsource", pkg, "files");

function font(pkg: string, file: string): Buffer {
  return readFileSync(join(FONT_DIR(pkg), file));
}

// Loaded once per build. Satori falls back across ALL loaded fonts for any
// glyph missing from the requested family — but it keeps only one font per
// (name, weight, style), so the Thai and Latin subsets MUST use distinct names
// or the Latin one gets dropped and Latin glyphs render as tofu (▯). Titles ask
// for "Mitr", body asks for "Noto"; every other entry is a fallback provider.
const FONTS = [
  // requested families (Thai)
  { name: "Mitr", data: font("mitr", "mitr-thai-600-normal.woff"), weight: 600, style: "normal" },
  { name: "Noto", data: font("noto-sans-thai", "noto-sans-thai-thai-400-normal.woff"), weight: 400, style: "normal" },
  // fallback pool — Latin letters, digits, punctuation (em dash, middot, %, €…)
  { name: "MitrLatin600", data: font("mitr", "mitr-latin-600-normal.woff"), weight: 600, style: "normal" },
  { name: "MitrLatinExt600", data: font("mitr", "mitr-latin-ext-600-normal.woff"), weight: 600, style: "normal" },
  { name: "NotoLatin400", data: font("noto-sans-thai", "noto-sans-thai-latin-400-normal.woff"), weight: 400, style: "normal" },
  { name: "NotoLatinExt400", data: font("noto-sans-thai", "noto-sans-thai-latin-ext-400-normal.woff"), weight: 400, style: "normal" },
] as const;

const ACCENT_HEX: Record<string, string> = {
  marigold: "#e4941f",
  naga: "#1f6559",
  lotus: "#e45c8a",
};

export interface OgCardInput {
  title: string;
  summary?: string;
  pillar: PillarId;
  merit?: boolean;
}

/** Returns a PNG Buffer for the given article. */
export async function renderOgCard(input: OgCardInput): Promise<Buffer> {
  const pillar = PILLAR_BY_ID[input.pillar];
  const accent = ACCENT_HEX[pillar.accent];

  const tree = {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        // cream paper with a warm marigold wash — never stark white
        background: "linear-gradient(135deg, #fdf1d6 0%, #fbf6ec 55%, #f8e2b6 100%)",
        fontFamily: "Noto",
        position: "relative",
      },
      children: [
        // top row: pillar chip + brand
        {
          type: "div",
          props: {
            style: { display: "flex", justifyContent: "space-between", alignItems: "center" },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    background: accent,
                    color: "#fff",
                    padding: "10px 26px",
                    borderRadius: "999px",
                    fontSize: "34px",
                    fontFamily: "Mitr",
                    fontWeight: 600,
                  },
                  children: pillar.label,
                },
              },
              {
                type: "div",
                props: {
                  style: { display: "flex", alignItems: "center", gap: "12px", fontSize: "30px", color: "#9c5c0e", fontFamily: "Mitr", fontWeight: 600 },
                  children: "๙ ฮักฝรั่ง",
                },
              },
            ],
          },
        },
        // title block
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column", gap: "22px", maxWidth: "1040px" },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontFamily: "Mitr",
                    fontWeight: 600,
                    fontSize: input.title.length > 40 ? "62px" : "78px",
                    lineHeight: 1.18,
                    color: "#124038",
                  },
                  children: input.title,
                },
              },
              input.summary
                ? {
                    type: "div",
                    props: {
                      style: { fontSize: "34px", lineHeight: 1.4, color: "#5c5148" },
                      children: input.summary,
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
        // bottom row: promise + merit badge
        {
          type: "div",
          props: {
            style: { display: "flex", justifyContent: "space-between", alignItems: "center" },
            children: [
              {
                type: "div",
                props: {
                  style: { fontSize: "30px", color: "#9c5c0e", fontFamily: "Mitr", fontWeight: 400 },
                  children: "พี่สาวที่ผ่านมาก่อน · อ่านฟรี ไม่ต้องอาย",
                },
              },
              input.merit
                ? {
                    type: "div",
                    props: {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "#e8f2f0",
                        color: "#175248",
                        padding: "8px 22px",
                        borderRadius: "999px",
                        fontSize: "28px",
                        fontFamily: "Mitr",
                      },
                      children: "อ่านฟรีเสมอ",
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
      ],
    },
  };

  const svg = await satori(tree as never, {
    width: 1200,
    height: 630,
    fonts: FONTS as never,
  });

  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
    .render()
    .asPng();
  return Buffer.from(png);
}
