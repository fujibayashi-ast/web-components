import { expect, test } from "@playwright/test";
import type { MyImageUploader } from "../../packages/ui/src/web-components/image-uploader";
import { imageBase64, imageFile, openDemo } from "../helpers";

test("image selection renders decoded previews, removes, and reselects files", async ({
  page,
}) => {
  await openDemo(page);
  const uploader = page.locator("my-image-uploader");
  const chooser = page.waitForEvent("filechooser");
  await uploader.getByRole("button", { name: "画像を選択" }).focus();
  await page.keyboard.press("Enter");
  await (await chooser).setFiles(imageFile());
  await expect(uploader.getByRole("img", { name: "avatar.png" })).toBeVisible();
  await expect
    .poll(() =>
      uploader
        .getByRole("img")
        .evaluate((element) => (element as HTMLImageElement).naturalWidth),
    )
    .toBe(1);
  await expect(uploader.getByText("画像: 1 枚", { exact: true })).toBeVisible();
  await expect(uploader.locator('input[type="file"]')).toHaveValue("");
  expect(
    await uploader.evaluate((element) =>
      (element as MyImageUploader).files.every((file) => file instanceof File),
    ),
  ).toBe(true);
  await uploader.getByRole("button", { name: "avatar.png を削除" }).click();
  await expect(uploader.getByRole("img")).toHaveCount(0);
  await uploader.locator('input[type="file"]').setInputFiles(imageFile());
  await expect(uploader.getByRole("img")).toHaveCount(1);
});

test("image selection rejects type, size, and count limits without losing accepted files", async ({
  page,
}) => {
  await openDemo(page);
  const uploader = page.locator("my-image-uploader");
  const input = uploader.locator('input[type="file"]');
  await input.setInputFiles(imageFile());
  await input.setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not an image"),
  });
  await expect(uploader.getByRole("alert")).toHaveText(
    "使用できる画像形式: image/png, image/jpeg, image/webp",
  );
  await expect(uploader.getByRole("img")).toHaveCount(1);
  await input.setInputFiles({
    name: "large.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(2 * 1024 * 1024 + 1),
  });
  await expect(uploader.getByRole("alert")).toHaveText(
    "画像は 2097152 バイト以下にしてください。",
  );
  await input.setInputFiles([
    imageFile("second.png"),
    imageFile("third.png"),
    imageFile("fourth.png"),
  ]);
  await expect(uploader.getByRole("alert")).toHaveText(
    "画像は最大 3 枚までです。",
  );
  await expect(uploader.getByRole("img")).toHaveCount(1);
  await input.setInputFiles(imageFile("second.png"));
  await expect(uploader.getByRole("img")).toHaveCount(2);
  await expect(uploader.getByRole("alert")).toHaveCount(0);
});

test("image drop works while disabled blocks choosing, removal, and drop", async ({
  page,
}) => {
  await openDemo(page);
  const uploader = page.locator("my-image-uploader");
  const drop = () =>
    uploader.evaluate((element, base64) => {
      const data = new DataTransfer();
      data.items.add(
        new File(
          [
            Uint8Array.from(atob(base64), (character) =>
              character.charCodeAt(0),
            ),
          ],
          "drop.png",
          { type: "image/png" },
        ),
      );
      element.shadowRoot?.querySelector('[part="drop-zone"]')?.dispatchEvent(
        new DragEvent("drop", {
          dataTransfer: data,
          bubbles: true,
          cancelable: true,
        }),
      );
    }, imageBase64);
  await drop();
  await expect(uploader.getByRole("img", { name: "drop.png" })).toBeVisible();
  await uploader.evaluate((element) => {
    (element as MyImageUploader).disabled = true;
  });
  await expect(
    uploader.getByRole("button", { name: "画像を選択" }),
  ).toBeDisabled();
  await expect(
    uploader.getByRole("button", { name: "drop.png を削除" }),
  ).toBeDisabled();
  await expect(uploader.locator('input[type="file"]')).toBeDisabled();
  await drop();
  await expect(uploader.getByRole("img")).toHaveCount(1);
  await uploader.evaluate((element) => {
    (element as MyImageUploader).disabled = false;
  });
  await drop();
  await expect(uploader.getByRole("img")).toHaveCount(2);
});

test("preview URLs are released on remove, replacement, reset, and detach, and recreated on reconnect", async ({
  page,
}) => {
  await openDemo(page);
  const state = await page.evaluate(async () => {
    const created: string[] = [];
    const revoked: string[] = [];
    const create = URL.createObjectURL.bind(URL);
    const revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      const url = create(blob);
      created.push(url);
      return url;
    };
    URL.revokeObjectURL = (url) => {
      revoked.push(url);
      revoke(url);
    };
    const uploader = document.createElement(
      "my-image-uploader",
    ) as MyImageUploader;
    document.body.append(uploader);
    const first = new File(["first"], "first.png", { type: "image/png" });
    const second = new File(["second"], "second.png", { type: "image/png" });
    uploader.files = [first];
    await uploader.updateComplete;
    uploader.files = [second];
    await uploader.updateComplete;
    uploader.remove();
    document.body.append(uploader);
    await uploader.updateComplete;
    uploader.shadowRoot
      ?.querySelector<HTMLButtonElement>('[part="remove-button"]')
      ?.click();
    await uploader.updateComplete;
    uploader.files = [first];
    await uploader.updateComplete;
    uploader.files = [];
    await uploader.updateComplete;
    uploader.remove();
    URL.createObjectURL = create;
    URL.revokeObjectURL = revoke;
    return { created, revoked, count: uploader.files.length };
  });
  expect(state.created).toHaveLength(4);
  expect(state.revoked).toEqual(state.created);
  expect(state.count).toBe(0);
});

test("file rejections take precedence over form errors and reset clears them", async ({
  page,
}) => {
  await openDemo(page);
  const uploader = page.locator("my-image-uploader");
  await page.getByRole("button", { name: "プロフィールを送信" }).click();
  await expect(uploader.getByRole("alert")).toHaveText(
    "画像を 1 枚以上選択してください。",
  );
  await uploader.evaluate((element) => {
    (element as MyImageUploader).allowedTypes = ["image/png"];
  });
  await uploader.locator('input[type="file"]').setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not an image"),
  });
  await expect(uploader.getByRole("alert")).toHaveText(
    "使用できる画像形式: image/png",
  );
  await page.getByRole("button", { name: "フォームをリセット" }).click();
  await expect(uploader.getByRole("alert")).toHaveCount(0);
});
