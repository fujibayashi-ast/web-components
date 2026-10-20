export type SaveState = "idle" | "saving" | "saved" | "failed";

export const saveLabels: Record<SaveState, string> = {
  idle: "待機中",
  saving: "保存中",
  saved: "保存済み",
  failed: "失敗",
};

export async function saveDemo(shouldFail: boolean) {
  await new Promise<void>((resolve) => globalThis.setTimeout(resolve, 1000));
  if (shouldFail) throw new Error("Demo save failed");
}
