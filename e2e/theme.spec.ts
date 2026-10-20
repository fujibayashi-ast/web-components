import { expect, test } from "@playwright/test";
import { openDemo } from "./helpers";

test("theme switches light and dark across the page and shadow controls and persists", async ({
  page,
}) => {
  await openDemo(page);
  const theme = page.getByRole("combobox", { name: "テーマ", exact: true });
  await theme.selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(10, 10, 10)",
  );
  await expect(page.getByRole("textbox", { name: "表示名" })).toHaveCSS(
    "color",
    "rgb(245, 245, 245)",
  );
  await expect(page.getByRole("textbox", { name: "表示名" })).toHaveCSS(
    "border-top-color",
    "rgb(163, 163, 163)",
  );
  await page.getByRole("button", { name: "プロフィールを送信" }).click();
  await expect(
    page.getByText("利用規約に同意してください。", { exact: true }),
  ).toHaveCSS("color", "rgb(248, 113, 113)");
  await page
    .getByRole("button", { name: "プロフィールを編集", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "プロフィールを編集", exact: true }),
  ).toHaveCSS("background-color", "rgb(23, 23, 23)");
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("data-ready", "true");
  await expect(theme).toHaveValue("dark");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(10, 10, 10)",
  );
  await theme.selectOption("light");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(245, 247, 251)",
  );
  await expect(page.getByRole("textbox", { name: "表示名" })).toHaveCSS(
    "color",
    "rgb(23, 23, 23)",
  );
  await expect(page.getByRole("textbox", { name: "表示名" })).toHaveCSS(
    "border-top-color",
    "rgb(115, 115, 115)",
  );
});

test("system follows OS changes while manual choices override the OS", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await openDemo(page);
  const theme = page.getByRole("combobox", { name: "テーマ", exact: true });
  await expect(theme).toHaveValue("system");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(10, 10, 10)",
  );
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(245, 247, 251)",
  );
  await theme.selectOption("dark");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(10, 10, 10)",
  );
  await theme.selectOption("light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(245, 247, 251)",
  );
  await theme.selectOption("system");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(10, 10, 10)",
  );
});

test("saved theme applies before app hydration and hydration produces no errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" || /hydrat/i.test(message.text()))
      errors.push(message.text());
  });
  await page.addInitScript(() => {
    localStorage.setItem("web-components.theme", "dark");
  });
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() === "script") await route.abort();
    else await route.continue();
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.unrouteAll();
  errors.length = 0;
  await openDemo(page);
  await expect(
    page.getByRole("combobox", { name: "テーマ", exact: true }),
  ).toHaveValue("dark");
  expect(errors).toEqual([]);
});

test("theme remains usable when its storage access is blocked", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem;
    const set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === "web-components.theme")
        throw new DOMException("Blocked", "SecurityError");
      return get.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === "web-components.theme")
        throw new DOMException("Blocked", "SecurityError");
      set.call(this, key, value);
    };
  });
  await openDemo(page);
  const theme = page.getByRole("combobox", { name: "テーマ", exact: true });
  await expect(theme).toHaveValue("system");
  await theme.selectOption("dark");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(10, 10, 10)",
  );
  await theme.selectOption("light");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(245, 247, 251)",
  );
});

test("theme changes in another tab update the current theme control", async ({
  page,
  context,
}) => {
  await openDemo(page);
  const other = await context.newPage();
  try {
    await openDemo(other);
    const theme = page.getByRole("combobox", { name: "テーマ", exact: true });
    await other
      .getByRole("combobox", { name: "テーマ", exact: true })
      .selectOption("dark");
    await expect(theme).toHaveValue("dark");
    await expect(page.locator("body")).toHaveCSS(
      "background-color",
      "rgb(10, 10, 10)",
    );
    await theme.selectOption("light");
    await expect(
      other.getByRole("combobox", { name: "テーマ", exact: true }),
    ).toHaveValue("light");
    await expect(other.locator("body")).toHaveCSS(
      "background-color",
      "rgb(245, 247, 251)",
    );
  } finally {
    await other.close();
  }
});
