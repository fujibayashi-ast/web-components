import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  cacheDir: `node_modules/.vite-${process.env.RENDER_MODE ?? "ssr"}`,
  plugins: [reactRouter(), tailwindcss()],
});
