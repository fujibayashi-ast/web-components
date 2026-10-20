import { expect, test } from "@playwright/test";
import { openDemo } from "../helpers";

test("my-checkbox forwards true and false and accepts parent-driven resets", async ({
  page,
}) => {
  await openDemo(page);
  const checkbox = page.getByRole("checkbox", { name: "更新を受け取る" });
  const state = page.getByRole("status");
  await expect(page.getByRole("textbox", { name: "表示名" })).toHaveValue(
    "花子",
  );
  await expect(checkbox).not.toBeChecked();

  await checkbox.check();
  await expect(state).toHaveText("名前: 花子 / 通知: オン");
  await checkbox.uncheck();
  await expect(state).toHaveText("名前: 花子 / 通知: オフ");

  await checkbox.check();
  await page.getByRole("button", { name: "入力をリセット" }).click();
  await expect(checkbox).not.toBeChecked();
  await expect(state).toHaveText("名前: 花子 / 通知: オフ");
});
