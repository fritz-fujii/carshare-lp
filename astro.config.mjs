import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://carshare-lp.pages.dev/",
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: "never" },
});
