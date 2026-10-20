import { expect, test } from "@playwright/test";
import { createElement } from "react";
import { renderToString as renderReact } from "react-dom/server";
import { createServer } from "vite";
import { createSSRApp, h } from "vue";
import { renderToString as renderVue } from "vue/server-renderer";
import { openDemo } from "./helpers";

test("HTTP response matches the selected rendering mode", async ({
  request,
}, testInfo) => {
  const response = await request.get("/");
  await expect(response).toBeOK();
  const html = await response.text();
  expect(html.includes("親が受け取った回数:")).toBe(
    testInfo.project.metadata.framework === "native" ||
      testInfo.project.metadata.rendering === "ssr",
  );
});

test("SSR returns the page and slots without JavaScript", async ({
  browser,
  baseURL,
}, testInfo) => {
  test.skip(testInfo.project.metadata.rendering !== "ssr", "SSR only");
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(baseURL ?? "/");
    await expect(page.locator("h1")).toContainText("Web Components");
    await expect(page.getByText("親が受け取った回数: 0")).toBeVisible();
    await expect(page.locator("my-card")).toContainText(
      "カードのスロットに差し込まれています",
    );
    await expect(page.locator("my-button")).toHaveCount(3);
    await expect(page.locator("my-input")).toHaveCount(2);
    await expect(page.locator("my-select")).toHaveCount(2);
    await expect(page.locator("my-checkbox")).toHaveCount(4);
    await expect(page.locator("my-image-uploader")).toHaveCount(1);
    await expect(page.getByTestId("form-result")).toHaveText(
      "まだ送信されていません",
    );
    await expect(page.locator("my-dialog")).toHaveCount(1);
    await expect(page.locator("my-dialog")).toBeHidden();
    await expect(page.locator("my-tabs")).toHaveCount(1);
    await expect(page.locator('my-tabs [slot="overview"]')).toContainText(
      "プロフィール: 花子",
    );
    await expect(page.getByRole("status")).toHaveText(
      "名前: 花子 / 通知: オフ",
    );
  } finally {
    await context.close();
  }
});

test("initial rendering and hydration produce no errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" || /hydrat/i.test(message.text())) {
      errors.push(message.text());
    }
  });
  await openDemo(page);
  const button = page.locator("my-button button").first();
  await expect(button).toHaveText("こんにちは、デモ！(0)");
  await button.click();
  await expect(page.getByText("親が受け取った回数: 1")).toBeVisible();
  await button.click();
  await expect(page.getByText("親が受け取った回数: 2")).toBeVisible();
  const input = page.getByRole("textbox", { name: "表示名" });
  await expect(input).toHaveValue("花子");
  await input.fill("Grace");
  await page.getByRole("checkbox", { name: "更新を受け取る" }).check();
  await expect(page.getByRole("status")).toHaveText("名前: Grace / 通知: オン");
  await page.getByRole("combobox", { name: "役割" }).selectOption("editor");
  await expect(
    page.getByText("選択中の役割: 編集者", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "設定", exact: true }).click();
  await expect(
    page.getByText("表示中のタブ: 設定", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "プロフィールを編集", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "プロフィールを編集", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "プロフィールを編集", exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByText("ダイアログ: 閉じています", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("disabled boolean props toggle and reset without losing input state", async ({
  page,
}) => {
  await openDemo(page);
  const input = page.getByRole("textbox", { name: "表示名" });
  const select = page.getByRole("combobox", { name: "役割" });
  const checkbox = page.getByRole("checkbox", { name: "更新を受け取る" });
  const disable = page.getByRole("checkbox", { name: "入力を無効にする" });
  await expect(input).toHaveValue("花子");
  await expect(input).toBeEnabled();
  await expect(checkbox).toBeEnabled();
  await expect(select).toBeEnabled();
  await expect(select).toHaveValue("reader");
  await input.fill("Grace");
  await select.selectOption("editor");
  await checkbox.check();

  await disable.check();
  await expect(input).toBeDisabled();
  await expect(checkbox).toBeDisabled();
  await expect(select).toBeDisabled();
  await expect(select).toHaveValue("editor");
  await expect(input).toHaveValue("Grace");
  await expect(checkbox).toBeChecked();
  await expect(page.getByRole("status")).toHaveText("名前: Grace / 通知: オン");

  await disable.uncheck();
  await expect(input).toBeEnabled();
  await expect(checkbox).toBeEnabled();
  await expect(select).toBeEnabled();
  await input.fill("Nora");
  await checkbox.uncheck();
  await expect(page.getByRole("status")).toHaveText("名前: Nora / 通知: オフ");

  await disable.check();
  await page.getByRole("button", { name: "入力をリセット" }).click();
  await expect(disable).not.toBeChecked();
  await expect(input).toBeEnabled();
  await expect(input).toHaveValue("花子");
  await expect(checkbox).toBeEnabled();
  await expect(checkbox).not.toBeChecked();
  await expect(select).toBeEnabled();
  await expect(select).toHaveValue("reader");
  await expect(
    page.getByText("選択中の役割: 閲覧者", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("名前: 花子 / 通知: オフ");
});

test("custom elements can be re-evaluated without duplicate registration", async ({
  page,
}, testInfo) => {
  await openDemo(page);
  await expect(page.locator("my-button button").first()).toHaveText(
    "こんにちは、デモ！(0)",
  );
  const prefix = testInfo.project.metadata.framework === "vue" ? "/_nuxt" : "";
  const source = `${prefix}/@fs/${process.cwd().replaceAll("\\", "/")}/packages/ui/src/web-components`;
  const unchanged = await page.evaluate(async (base) => {
    const names = [
      "button",
      "card",
      "input",
      "checkbox",
      "select",
      "dialog",
      "tabs",
      "image-uploader",
    ];
    const constructors = names.map((name) => customElements.get(`my-${name}`));
    for (const name of names) {
      await import(`${base}/${name}/index.ts?registration-test=1`);
    }
    return names.every(
      (name, index) =>
        typeof constructors[index] === "function" &&
        customElements.get(`my-${name}`) === constructors[index],
    );
  }, source);
  expect(unchanged).toBe(true);
  await page.locator("my-button button").first().click();
  await expect(page.getByText("親が受け取った回数: 1")).toBeVisible();
});

for (const viewport of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile", width: 375, height: 812 },
]) {
  test(`shared layout fits the ${viewport.name} viewport`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openDemo(page);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Web Components",
    );
    await expect(page.locator("my-button button").nth(1)).toBeVisible();
    await expect(page.locator("my-card h2")).toHaveText(
      "こんにちは、スロットの内容！",
    );
    await expect(page.getByRole("textbox", { name: "表示名" })).toHaveValue(
      "花子",
    );
    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      contained: Array.from(document.querySelectorAll("main > *")).every(
        (element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.left >= 0 && bounds.right <= window.innerWidth;
        },
      ),
    }));
    expect(layout).toEqual({ overflow: false, contained: true });
  });
}

test("entry points render on the server without browser globals", async () => {
  expect(typeof window).toBe("undefined");
  const server = await createServer({
    configFile: false,
    server: { middlewareMode: true },
    appType: "custom",
  });
  try {
    const elements = await server.ssrLoadModule(
      "/packages/ui/src/web-components/index.ts",
    );
    expect(elements.MyButton.tagName).toBe("my-button");
    expect(elements.MyInput.tagName).toBe("my-input");
    expect(elements.MyCheckbox.tagName).toBe("my-checkbox");
    expect(elements.MySelect.tagName).toBe("my-select");
    expect(elements.MyDialog.tagName).toBe("my-dialog");
    expect(elements.MyTabs.tagName).toBe("my-tabs");
    expect(elements.MyImageUploader.tagName).toBe("my-image-uploader");
    const react = await server.ssrLoadModule("/packages/ui/src/react/index.ts");
    const vue = await server.ssrLoadModule("/packages/ui/src/vue/index.ts");
    const reactHTML = renderReact(
      createElement(
        react.MyCard,
        { label: "SSR" },
        createElement(react.MyButton, { name: "SSR" }),
        createElement(react.MyInput, { label: "SSR", value: "Ada" }),
        createElement(react.MyCheckbox, { label: "SSR", checked: true }),
        createElement(react.MyImageUploader, { label: "SSR", files: [] }),
        createElement(react.MySelect, {
          label: "SSR",
          value: "reader",
          options: [{ value: "reader", label: "Reader" }],
        }),
        createElement(
          react.MyDialog,
          { label: "SSR", open: false, hidden: true },
          "Dialog content",
        ),
        createElement(
          react.MyTabs,
          {
            label: "SSR",
            value: "overview",
            items: [{ value: "overview", label: "Overview" }],
          },
          createElement("p", { slot: "overview" }, "Tab content"),
        ),
      ),
    );
    const vueHTML = await renderVue(
      createSSRApp({
        render: () =>
          h(vue.MyCard, { label: "SSR" }, () => [
            h(vue.MyButton, { name: "SSR" }),
            h(vue.MyInput, { label: "SSR", value: "Ada" }),
            h(vue.MyCheckbox, { label: "SSR", checked: true }),
            h(vue.MyImageUploader, { label: "SSR", files: [] }),
            h(vue.MySelect, {
              label: "SSR",
              value: "reader",
              options: [{ value: "reader", label: "Reader" }],
            }),
            h(
              vue.MyDialog,
              { label: "SSR", open: false, hidden: true },
              () => "Dialog content",
            ),
            h(
              vue.MyTabs,
              {
                label: "SSR",
                value: "overview",
                items: [{ value: "overview", label: "Overview" }],
              },
              () => h("p", { slot: "overview" }, "Tab content"),
            ),
          ]),
      }),
    );
    for (const markup of [reactHTML, vueHTML]) {
      expect(markup).toContain("<my-card");
      expect(markup).toContain("<my-image-uploader");
      expect(markup).toContain("<my-button");
      expect(markup).toContain("<my-input");
      expect(markup).toContain("<my-checkbox");
      expect(markup).toContain("<my-select");
      expect(markup).toContain("<my-dialog");
      expect(markup).toContain("<my-tabs");
      expect(markup).toContain("Tab content");
    }
  } finally {
    await server.close();
  }
});
