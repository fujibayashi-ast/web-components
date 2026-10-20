import { expect, test } from "@playwright/test";
import type { MyButton } from "../../packages/ui/src/web-components/button";
import { openDemo } from "../helpers";

test("loading and disabled block button events without changing its dimensions", async ({
  page,
}) => {
  await openDemo(page);
  const host = page.locator("my-button").first();
  const button = host.locator("button");
  const bounds = await button.boundingBox();
  await host.evaluate((element) => {
    (element as MyButton).loading = true;
  });
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute("aria-busy", "true");
  await button.dispatchEvent("click");
  await expect(button).toHaveText("こんにちは、デモ！(0)");
  await expect(page.getByText("親が受け取った回数: 0")).toBeVisible();
  expect(await button.boundingBox()).toEqual(bounds);
  await host.evaluate((element) => {
    const host = element as MyButton;
    host.loading = false;
    host.disabled = true;
  });
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute("aria-busy", "false");
  await button.dispatchEvent("click");
  await expect(button).toHaveText("こんにちは、デモ！(0)");
  await host.evaluate((element) => {
    (element as MyButton).disabled = false;
  });
  await button.click();
  await expect(page.getByText("親が受け取った回数: 1")).toBeVisible();
});

test("my-button increments and forwards count-change to the host app", async ({
  page,
}) => {
  await openDemo(page);
  const button = page.locator("my-button button").first();
  await expect(button).toHaveText("こんにちは、デモ！(0)");

  await button.click();
  await expect(button).toContainText("(1)");
  await expect(page.getByText("親が受け取った回数: 1")).toBeVisible();

  await button.click();
  await expect(button).toContainText("(2)");
  await expect(page.getByText("親が受け取った回数: 2")).toBeVisible();
  await expect(page.locator("my-card")).toContainText(
    "スロット内のカウント: 2",
  );
});

test("buttonClass merges inner button styles and resolves conflicts", async ({
  page,
}) => {
  await openDemo(page);
  const button = page.locator("my-button button").nth(1);
  await expect(button).toHaveText("こんにちは、カスタム！(0)");
  const classes = (await button.getAttribute("class")) ?? "";
  expect(classes).toContain("bg-emerald-600");
  expect(classes).not.toContain("bg-blue-500");
  expect(classes).toContain("rounded");
  await expect(button).toHaveCSS("width", "256px");
});

test("async save restores loading after success and failure and prevents repeated execution", async ({
  page,
}) => {
  await openDemo(page);
  const button = page.getByRole("button", {
    name: "変更を保存",
    exact: true,
  });
  const host = page.locator("my-button").filter({ has: button });
  const state = page.getByTestId("save-state");
  const failure = page.getByRole("checkbox", { name: "保存を失敗させる" });
  await expect(state).toHaveText("保存: 待機中");
  await button.click();
  await expect(button).toHaveAttribute("aria-busy", "true");
  await expect(button).toBeDisabled();
  await expect(failure).toBeDisabled();
  await expect(state).toHaveText("保存: 保存中");
  await button.dispatchEvent("click");
  await expect(state).toHaveText("保存: 保存済み");
  await expect(button).toHaveAttribute("aria-busy", "false");
  await expect(button).toBeEnabled();
  await expect(host).toHaveJSProperty("count", 1);
  await failure.check();
  await button.click();
  await expect(state).toHaveText("保存: 失敗");
  await expect(button).toBeEnabled();
  await expect(button).toHaveAttribute("aria-busy", "false");
  await expect(failure).toBeEnabled();
  await failure.uncheck();
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(state).toHaveText("保存: 保存中");
  await expect(state).toHaveText("保存: 保存済み");
  await expect(host).toHaveJSProperty("count", 3);
  await expect(page.getByText("親が受け取った回数: 0")).toBeVisible();
});
