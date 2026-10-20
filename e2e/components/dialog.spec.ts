import { expect, test } from "@playwright/test";
import { openDemo } from "../helpers";

test("my-dialog projects editable content and forwards user closure", async ({
  page,
}) => {
  await openDemo(page);
  const trigger = page.getByRole("button", {
    name: "プロフィールを編集",
    exact: true,
  });
  const dialog = page.getByRole("dialog", {
    name: "プロフィールを編集",
    exact: true,
  });
  await expect(dialog).not.toBeVisible();
  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(
    page.getByText("ダイアログ: 開いています", { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "閉じる", exact: true }),
  ).toBeFocused();
  await page
    .locator("my-dialog")
    .getByRole("textbox", { name: "プロフィール名" })
    .fill("Grace");
  await dialog.getByRole("button", { name: "閉じる", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByText("ダイアログ: 閉じています", { exact: true }),
  ).toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("textbox", { name: "表示名" })).toHaveValue(
    "Grace",
  );
  await expect(page.locator('my-tabs [slot="overview"]')).toContainText(
    "プロフィール: Grace",
  );
});

test("my-dialog closes on Escape and can reopen without runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openDemo(page);
  const trigger = page.getByRole("button", {
    name: "プロフィールを編集",
    exact: true,
  });
  const dialog = page.getByRole("dialog", {
    name: "プロフィールを編集",
    exact: true,
  });
  for (let iteration = 0; iteration < 3; iteration++) {
    await trigger.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByText("ダイアログ: 閉じています", { exact: true }),
    ).toBeVisible();
    await expect(trigger).toBeFocused();
  }
  expect(errors).toEqual([]);
});

test("my-dialog keeps focus inside the modal and accepts parent closure", async ({
  page,
}) => {
  await openDemo(page);
  const trigger = page.getByRole("button", {
    name: "プロフィールを編集",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: "プロフィールを編集",
    exact: true,
  });
  const close = dialog.getByRole("button", { name: "閉じる", exact: true });
  const input = page
    .locator("my-dialog")
    .getByRole("textbox", { name: "プロフィール名" });
  const done = page
    .locator("my-dialog")
    .getByRole("button", { name: "完了", exact: true });
  await expect(close).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(done).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(done).toBeFocused();
  await done.click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByText("ダイアログ: 閉じています", { exact: true }),
  ).toBeVisible();
  await expect(trigger).toBeFocused();
});
