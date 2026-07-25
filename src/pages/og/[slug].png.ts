import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { renderOgCard } from "@/lib/og";

export async function getStaticPaths() {
  const articles = await getCollection("articles", ({ data }) => !data.draft);
  return articles.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as { entry: import("astro:content").CollectionEntry<"articles"> };
  const png = await renderOgCard({
    title: entry.data.title_th,
    summary: entry.data.summary,
    pillar: entry.data.pillar,
    merit: entry.data.merit,
  });
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
