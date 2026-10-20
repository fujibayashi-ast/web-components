import type { Config } from "@react-router/dev/config";

const rendering = process.env.RENDER_MODE === "spa" ? "spa" : "ssr";

export default {
  buildDirectory: `build/${rendering}`,
  ssr: rendering === "ssr",
} satisfies Config;
