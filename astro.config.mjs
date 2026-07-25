// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// The public URL of the site. Domain: hakfarang.net (bought 2026-07-25).
export const SITE = "https://hakfarang.net";

export default defineConfig({
  site: SITE,
  // Mobile-first, share-first static site. Fast on cheap Android over mobile data.
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    // Trailing-slash-free clean URLs that survive a cold Facebook share.
    format: "directory",
  },
});
