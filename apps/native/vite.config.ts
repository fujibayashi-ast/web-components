import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { themeBootstrapScript } from "../theme";

export default defineConfig({
  plugins: [
    tailwindcss(),
    {
      name: "theme-bootstrap",
      transformIndexHtml() {
        return [
          {
            tag: "script",
            children: themeBootstrapScript,
            injectTo: "head-prepend",
          },
        ];
      },
    },
  ],
});
