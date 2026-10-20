import { expect, test } from "@playwright/test";
import { openDemo } from "../helpers";

test("my-tabs projects named slots, forwards selection, and accepts parent resets", async ({
  page,
}) => {
  await openDemo(page);
  const overview = page.getByRole("tab", { name: "概要", exact: true });
  const preferences = page.getByRole("tab", {
    name: "設定",
    exact: true,
  });
  const panel = page.getByRole("tabpanel", { name: "概要", exact: true });
  const overviewContent = page.locator('my-tabs [slot="overview"]');
  await expect(
    page.getByRole("tablist", { name: "プロフィール表示" }),
  ).toBeVisible();
  await expect(overview).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab", { name: "履歴" })).toBeDisabled();
  await expect(panel).toBeVisible();
  await expect(overviewContent).toBeVisible();
  await expect(overviewContent).toContainText("プロフィール: 花子");
  await expect(overview).toHaveAttribute(
    "aria-controls",
    (await panel.getAttribute("id")) ?? "",
  );
  await expect(panel).toHaveAttribute(
    "aria-labelledby",
    (await overview.getAttribute("id")) ?? "",
  );
  await expect(page.locator("my-tabs")).not.toHaveAttribute("items");

  await page.getByRole("textbox", { name: "表示名" }).fill("Grace");
  await expect(overviewContent).toContainText("プロフィール: Grace");
  await page.getByRole("checkbox", { name: "更新を受け取る" }).check();
  await preferences.click();
  await expect(preferences).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByText("表示中のタブ: 設定", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("tabpanel", { name: "設定" })).toBeVisible();
  await expect(page.locator('my-tabs [slot="preferences"]')).toContainText(
    "通知: オン",
  );
  await expect(page.locator('my-tabs [slot="preferences"]')).toBeVisible();
  await expect(overviewContent).not.toBeVisible();
  await expect(page.getByRole("tabpanel")).toHaveCount(1);

  await page.getByRole("button", { name: "表示をリセット" }).click();
  await expect(overview).toHaveAttribute("aria-selected", "true");
  await expect(panel).toBeVisible();
  await expect(
    page.getByText("表示中のタブ: 概要", { exact: true }),
  ).toBeVisible();
});

test("my-tabs uses roving focus and skips disabled tabs with arrows and Home/End", async ({
  page,
}) => {
  await openDemo(page);
  const overview = page.getByRole("tab", { name: "概要", exact: true });
  const preferences = page.getByRole("tab", {
    name: "設定",
    exact: true,
  });
  await expect(overview).toHaveAttribute("tabindex", "0");
  await expect(preferences).toHaveAttribute("tabindex", "-1");
  await overview.focus();
  await overview.press("ArrowRight");
  await expect(preferences).toBeFocused();
  await expect(preferences).toHaveAttribute("aria-selected", "true");
  await expect(preferences).toHaveAttribute("tabindex", "0");
  await expect(overview).toHaveAttribute("tabindex", "-1");
  await expect(
    page.getByText("表示中のタブ: 設定", { exact: true }),
  ).toBeVisible();

  await preferences.press("ArrowRight");
  await expect(overview).toBeFocused();
  await overview.press("ArrowLeft");
  await expect(preferences).toBeFocused();
  await preferences.press("Home");
  await expect(overview).toBeFocused();
  await overview.press("End");
  await expect(preferences).toBeFocused();
  await expect(page.getByRole("tab", { name: "履歴" })).toHaveAttribute(
    "aria-selected",
    "false",
  );
});

test("my-tabs reverses horizontal arrow navigation in RTL", async ({
  page,
}) => {
  await openDemo(page);
  await page.locator("my-tabs").evaluate((element) => {
    const host = element as HTMLElement & {
      items: { value: string; label: string }[];
    };
    host.setAttribute("dir", "rtl");
    host.items = [
      { value: "overview", label: "概要" },
      { value: "preferences", label: "設定" },
      { value: "archive", label: "アーカイブ" },
    ];
  });
  const overview = page.getByRole("tab", { name: "概要", exact: true });
  const preferences = page.getByRole("tab", {
    name: "設定",
    exact: true,
  });
  await overview.focus();
  await overview.press("ArrowLeft");
  await expect(preferences).toBeFocused();
  await expect(
    page.getByText("表示中のタブ: 設定", { exact: true }),
  ).toBeVisible();
  await preferences.press("ArrowRight");
  await expect(overview).toBeFocused();
  await expect(
    page.getByText("表示中のタブ: 概要", { exact: true }),
  ).toBeVisible();
});
