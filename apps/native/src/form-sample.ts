import {
  createFormDefaults,
  formRoles,
  formValidators,
  type ProfileFormValues,
  serializeSubmission,
} from "../../form-demo";

export function setupFormSample() {
  const form = document.querySelector<HTMLFormElement>(
    'form[aria-label="プロフィールフォーム"]',
  );
  const name = form?.querySelector("my-input");
  const role = form?.querySelector("my-select");
  const consent = form?.querySelector("my-checkbox");
  const images = form?.querySelector("my-image-uploader");
  const result = form?.querySelector<HTMLElement>(
    '[data-testid="form-result"]',
  );
  if (!form || !name || !role || !consent || !images || !result)
    throw new Error("Form sample elements not found");
  let values = createFormDefaults();
  let submitted = false;
  role.options = formRoles;

  const validateField = (field: keyof ProfileFormValues) => {
    if (field === "name")
      name.error =
        formValidators.name(values.name) === true
          ? ""
          : "アカウント名を入力してください。";
    if (field === "role")
      role.error =
        formValidators.role(values.role) === true
          ? ""
          : "アクセス権限を選択してください。";
    if (field === "consent")
      consent.error =
        formValidators.consent(values.consent) === true
          ? ""
          : "利用規約に同意してください。";
    if (field === "images")
      images.error =
        formValidators.images(values.images) === true
          ? ""
          : "画像を 1 枚以上選択してください。";
  };

  name.addEventListener("value-change", () => {
    values.name = name.value;
    if (submitted) validateField("name");
  });
  role.addEventListener("value-change", () => {
    values.role = role.value;
    if (submitted) validateField("role");
  });
  consent.addEventListener("checked-change", () => {
    values.consent = consent.checked;
    if (submitted) validateField("consent");
  });
  images.addEventListener("files-change", () => {
    values.images = [...images.files];
    if (submitted) validateField("images");
  });
  name.addEventListener("focusout", () => validateField("name"));
  role.addEventListener("focusout", () => validateField("role"));
  consent.addEventListener("focusout", () => validateField("consent"));
  images.addEventListener("focusout", () => validateField("images"));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitted = true;
    for (const field of ["name", "role", "consent", "images"] as const)
      validateField(field);
    const invalid = [name, role, consent, images].find(
      (element) => element.error,
    );
    if (invalid) invalid.focus();
    else result.textContent = serializeSubmission(values);
  });

  form.addEventListener("reset", (event) => {
    event.preventDefault();
    values = createFormDefaults();
    submitted = false;
    name.value = values.name;
    role.value = values.role;
    consent.checked = values.consent;
    images.files = values.images;
    for (const element of [name, role, consent, images]) element.error = "";
    result.textContent = "まだ送信されていません";
  });
}
