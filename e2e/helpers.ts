import { expect, type Page } from "@playwright/test";

export const imageBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a29kAAAAASUVORK5CYII=";

export function imageFile(name = "avatar.png") {
  return {
    name,
    mimeType: "image/png",
    buffer: Buffer.from(imageBase64, "base64"),
  };
}

export async function openDemo(page: Page) {
  await page.goto("/");
  await expect(page.locator("main")).toHaveAttribute("data-ready", "true");
  await expect(page.locator("my-button button").first()).toHaveText(
    "こんにちは、デモ！(0)",
  );
}
