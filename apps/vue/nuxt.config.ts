import tailwindcss from "@tailwindcss/vite";
import { defineNuxtConfig } from "nuxt/config";
import { themeBootstrapScript } from "../theme";

const rendering = process.env.RENDER_MODE === "spa" ? "spa" : "ssr";

export default defineNuxtConfig({
  compatibilityDate: "2026-10-13",
  buildDir: `.nuxt/${rendering}`,
  typesDir: ".nuxt",
  ssr: rendering === "ssr",
  devtools: { enabled: false },
  telemetry: false,
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      title: "Web Components",
      htmlAttrs: { lang: "ja" },
      script: [{ innerHTML: themeBootstrapScript }],
    },
  },
  vite: {
    cacheDir: `node_modules/.vite-${rendering}`,
    plugins: [tailwindcss()],
  },
  nitro: {
    output: { dir: `.output/${rendering}` },
  },
});
