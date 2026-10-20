export const roleOptions = [
  { value: "reader", label: "閲覧者" },
  { value: "editor", label: "編集者" },
  { value: "admin", label: "管理者", disabled: true },
];

export const tabItems = [
  { value: "overview", label: "概要" },
  { value: "preferences", label: "設定" },
  { value: "history", label: "履歴", disabled: true },
];

/** Label for a value, falling back to the value when it is not in the list. */
export function labelOf(
  options: readonly { value: string; label: string }[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}
