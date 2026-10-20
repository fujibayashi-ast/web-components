import type { Preview } from "@storybook/web-components-vite";
import { html } from "lit";
import { useEffect } from "storybook/preview-api";
import "../../../apps/demo.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Theme",
      toolbar: {
        icon: "paintbrush",
        dynamicTitle: true,
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
          { value: "system", title: "System" },
        ],
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (story, context) => {
      const theme = context.globals.theme;
      document.documentElement.dataset.theme = theme;
      document.documentElement.classList.toggle(
        "dark",
        theme === "dark" ||
          (theme === "system" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches),
      );
      useEffect(() => {
        if (theme !== "system") return;
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const update = () =>
          document.documentElement.classList.toggle("dark", media.matches);
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
      }, [theme]);
      return html`
        <div
          style="width: min(100%, 32rem); color: var(--demo-foreground); background: var(--demo-background)"
        >
          ${story()}
        </div>
      `;
    },
  ],
  parameters: {
    layout: "padded",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export default preview;
