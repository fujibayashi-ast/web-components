import { defineConfig, devices } from "@playwright/test";

const sites = [
  { name: "react-spa", app: "react", rendering: "spa", port: 5199 },
  { name: "vue-spa", app: "vue", rendering: "spa", port: 5198 },
  { name: "react-ssr", app: "react", rendering: "ssr", port: 5197 },
  { name: "vue-ssr", app: "vue", rendering: "ssr", port: 5196 },
  { name: "native", app: "native", rendering: "spa", port: 5195 },
];

const selectedSite = process.env.E2E_SITE;
if (selectedSite && !sites.some((site) => site.name === selectedSite)) {
  throw new Error(`Unknown E2E_SITE: ${selectedSite}`);
}
const activeSites = sites.filter(
  (site) => !selectedSite || site.name === selectedSite,
);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    trace: "on-first-retry",
  },
  projects: activeSites.map((site) => ({
    name: site.name,
    metadata: { framework: site.app, rendering: site.rendering },
    use: {
      ...devices["Desktop Chrome"],
      baseURL: `http://127.0.0.1:${site.port}`,
    },
  })),
  webServer: activeSites.map((site) => ({
    command: `bun run --filter ./apps/${site.app} ${site.rendering === "ssr" ? "dev:ssr" : "dev"} --host 127.0.0.1 --port ${site.port}${site.app === "vue" ? "" : " --strictPort"}`,
    url: `http://127.0.0.1:${site.port}`,
    reuseExistingServer: !process.env.CI,
  })),
});
