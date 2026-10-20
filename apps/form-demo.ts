export interface ProfileFormValues {
  name: string;
  role: string;
  consent: boolean;
  images: File[];
}

export const formRoles = [
  { value: "reader", label: "閲覧者" },
  { value: "editor", label: "編集者" },
];

export function createFormDefaults(): ProfileFormValues {
  return { name: "花子", role: "reader", consent: false, images: [] };
}

export const formValidators = {
  name: (value: string) =>
    value.trim().length > 0 || "アカウント名を入力してください。",
  role: (value: string) =>
    formRoles.some((option) => option.value === value) ||
    "アクセス権限を選択してください。",
  consent: (value: boolean) => value === true || "利用規約に同意してください。",
  images: (value: readonly File[]) =>
    value.length > 0 || "画像を 1 枚以上選択してください。",
};

export function serializeSubmission(values: ProfileFormValues) {
  return JSON.stringify({
    name: values.name,
    role: values.role,
    consent: values.consent,
    images: values.images.map((file) => ({
      name: file.name,
      type: file.type,
      size: file.size,
    })),
  });
}
