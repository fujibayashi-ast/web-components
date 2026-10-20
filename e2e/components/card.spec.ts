import { expect, test } from "@playwright/test";
import { openDemo } from "../helpers";

test("my-card renders its shadow heading and projects slotted content", async ({
  page,
}) => {
  await openDemo(page);
  const card = page.locator("my-card");
  await expect(card.locator("h2")).toHaveText("こんにちは、スロットの内容！");
  await expect(card).toContainText("カードのスロットに差し込まれています");
});
