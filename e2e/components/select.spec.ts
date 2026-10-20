import { expect, test } from "@playwright/test";
import { openDemo } from "../helpers";

test("my-select receives array options and forwards selected values", async ({
  page,
}) => {
  await openDemo(page);
  const select = page.getByRole("combobox", { name: "役割" });
  await expect(select).toHaveValue("reader");
  await expect(select.locator("option")).toHaveText([
    "選択してください",
    "閲覧者",
    "編集者",
    "管理者",
  ]);
  await expect(select.locator('option[value="admin"]')).toHaveJSProperty(
    "disabled",
    true,
  );
  await expect(page.locator("my-select").first()).not.toHaveAttribute(
    "options",
  );

  await select.selectOption("editor");
  await expect(
    page.getByText("選択中の役割: 編集者", { exact: true }),
  ).toBeVisible();
  await select.selectOption("");
  await expect(
    page.getByText("選択中の役割: なし", { exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "入力をリセット" }).click();
  await expect(select).toHaveValue("reader");
  await expect(
    page.getByText("選択中の役割: 閲覧者", { exact: true }),
  ).toBeVisible();
  await select.selectOption("editor");
  await expect(
    page.getByText("選択中の役割: 編集者", { exact: true }),
  ).toBeVisible();
});

test("my-select updates options supplied as element properties", async ({
  page,
}) => {
  await openDemo(page);
  const select = page.getByRole("combobox", { name: "役割" });
  await select.selectOption("editor");
  await expect(
    page.getByText("選択中の役割: 編集者", { exact: true }),
  ).toBeVisible();

  await page
    .locator("my-select")
    .first()
    .evaluate((element) => {
      const host = element as HTMLElement & {
        options: { value: string; label: string; disabled?: boolean }[];
      };
      host.options = [
        { value: "reviewer", label: "Reviewer" },
        { value: "editor", label: "Editor & <review>" },
        { value: "owner", label: "Owner", disabled: true },
      ];
    });

  await expect(select.locator("option")).toHaveText([
    "選択してください",
    "Reviewer",
    "Editor & <review>",
    "Owner",
  ]);
  await expect(select).toHaveValue("editor");
  await expect(select.locator('option[value="owner"]')).toHaveJSProperty(
    "disabled",
    true,
  );
  await select.selectOption("reviewer");
  await expect(
    page.getByText("選択中の役割: reviewer", { exact: true }),
  ).toBeVisible();
});
