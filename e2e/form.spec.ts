import { expect, test } from "@playwright/test";
import { imageFile, openDemo } from "./helpers";

test("form adapters validate blur, focus errors, and submit typed values", async ({
  page,
}) => {
  await openDemo(page);
  const form = page.getByRole("form", { name: "プロフィールフォーム" });
  const name = form.getByRole("textbox", { name: "アカウント名" });
  const role = form.getByRole("combobox", { name: "アクセス権限" });
  const consent = form.getByRole("checkbox", { name: "利用規約に同意する" });
  await expect(form.getByRole("alert")).toHaveCount(0);
  await expect(name).toHaveValue("花子");
  await expect(role).toHaveValue("reader");
  await expect(consent).not.toBeChecked();

  await name.fill(" ");
  await name.press("Tab");
  await expect(
    form.getByText("アカウント名を入力してください。", { exact: true }),
  ).toBeVisible();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await role.selectOption("");
  await role.press("Tab");
  await expect(
    form.getByText("アクセス権限を選択してください。", { exact: true }),
  ).toBeVisible();
  await consent.focus();
  await consent.press("Tab");
  await expect(
    form.getByText("利用規約に同意してください。", { exact: true }),
  ).toBeVisible();
  await form.getByRole("button", { name: "プロフィールを送信" }).click();
  await expect(name).toBeFocused();
  await expect(
    form.getByText("画像を 1 枚以上選択してください。", { exact: true }),
  ).toBeVisible();
  await expect(form.getByTestId("form-result")).toHaveText(
    "まだ送信されていません",
  );

  await name.fill("Grace & <Ada>");
  await form.getByRole("button", { name: "プロフィールを送信" }).click();
  await expect(role).toBeFocused();
  await role.selectOption("editor");
  await consent.check();
  await form.getByRole("button", { name: "プロフィールを送信" }).click();
  await expect(form.getByRole("button", { name: "画像を選択" })).toBeFocused();
  await form.locator('input[type="file"]').setInputFiles(imageFile());
  await form.getByRole("button", { name: "プロフィールを送信" }).click();
  await expect(form.getByRole("alert")).toHaveCount(0);
  await expect(form.getByTestId("form-result")).toContainText(
    '"name":"Grace & <Ada>"',
  );
  const result = JSON.parse(await form.getByTestId("form-result").innerText());
  expect(result).toEqual({
    name: "Grace & <Ada>",
    role: "editor",
    consent: true,
    images: [
      {
        name: "avatar.png",
        type: "image/png",
        size: imageFile().buffer.length,
      },
    ],
  });
});

test("reset restores values and clears form, file, and validation state", async ({
  page,
}) => {
  await openDemo(page);
  const form = page.getByRole("form", { name: "プロフィールフォーム" });
  await form.getByRole("textbox", { name: "アカウント名" }).fill("Grace");
  await form
    .getByRole("combobox", { name: "アクセス権限" })
    .selectOption("editor");
  await form.getByRole("checkbox", { name: "利用規約に同意する" }).check();
  await form.locator('input[type="file"]').setInputFiles(imageFile());
  await form.getByRole("button", { name: "プロフィールを送信" }).click();
  await expect(form.getByTestId("form-result")).toContainText('"name":"Grace"');
  await form.getByRole("textbox", { name: "アカウント名" }).fill("");
  await form.getByRole("button", { name: "プロフィールを送信" }).click();
  await expect(form.getByRole("alert")).not.toHaveCount(0);

  await form.getByRole("button", { name: "フォームをリセット" }).click();
  await expect(form.getByRole("textbox", { name: "アカウント名" })).toHaveValue(
    "花子",
  );
  await expect(
    form.getByRole("combobox", { name: "アクセス権限" }),
  ).toHaveValue("reader");
  await expect(
    form.getByRole("checkbox", { name: "利用規約に同意する" }),
  ).not.toBeChecked();
  await expect(form.getByRole("img")).toHaveCount(0);
  await expect(form.getByRole("alert")).toHaveCount(0);
  await expect(form.getByTestId("form-result")).toHaveText(
    "まだ送信されていません",
  );
  await expect(form.locator('input[type="file"]')).toHaveValue("");
  await form.getByRole("button", { name: "プロフィールを送信" }).click();
  await expect(
    form.getByRole("checkbox", { name: "利用規約に同意する" }),
  ).toBeFocused();
});
