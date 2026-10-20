import { expect, test } from "@playwright/test";
import { openDemo } from "../helpers";

test("my-input forwards values and accepts parent-driven resets", async ({
  page,
}) => {
  await openDemo(page);
  const input = page.getByRole("textbox", { name: "表示名" });
  const state = page.getByRole("status");
  await expect(input).toHaveValue("花子");
  await expect(input).toHaveAttribute("placeholder", "名前を入力");

  await input.fill("Grace & <Ada>");
  await expect(state).toHaveText("名前: Grace & <Ada> / 通知: オフ");
  await input.fill("");
  await expect(state).toHaveText("名前:  / 通知: オフ");

  await page.getByRole("button", { name: "入力をリセット" }).click();
  await expect(input).toHaveValue("花子");
  await expect(state).toHaveText("名前: 花子 / 通知: オフ");
  await input.fill("Lin");
  await expect(state).toHaveText("名前: Lin / 通知: オフ");
});
