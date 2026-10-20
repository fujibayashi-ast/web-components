import "@web-components/ui";
import type {
  MyButton,
  MyButtonCountChangeDetail,
  MyCheckbox,
  MyCheckboxCheckedChangeDetail,
  MyDialogOpenChangeDetail,
  MyInputValueChangeDetail,
  MySelectValueChangeDetail,
  MyTabsValueChangeDetail,
} from "@web-components/ui";
import "./style.css";
import { saveDemo } from "../../async-demo";
import { labelOf, roleOptions, tabItems } from "../../demo-options";
import { mountThemeControl } from "../../theme";
import { setupFormSample } from "./form-sample";

const observed = document.getElementById("observed-count");
const slotted = document.getElementById("slotted-count");
if (!observed || !slotted) throw new Error("Demo count elements not found");

for (const button of document.querySelectorAll("my-button:not(#save-button)")) {
  button.addEventListener("count-change", (event) => {
    const { count } = (event as CustomEvent<MyButtonCountChangeDetail>).detail;
    observed.textContent = `親が受け取った回数: ${count}`;
    slotted.textContent = `スロット内のカウント: ${count}`;
  });
}

const input = document.querySelector("my-input");
const select = document.querySelector("my-select");
const selectedRole = document.getElementById("selected-role");
const updates = document.querySelector<MyCheckbox>("#updates");
const disableInputs = document.querySelector<MyCheckbox>("#disable-inputs");
const inputState = document.getElementById("input-state");
const reset = document.getElementById("reset-inputs");
if (
  !input ||
  !select ||
  !selectedRole ||
  !updates ||
  !disableInputs ||
  !inputState ||
  !reset
) {
  throw new Error("Demo input elements not found");
}

let displayName = "花子";
let subscribed = false;

select.options = roleOptions;

select.addEventListener("value-change", (event) => {
  const { value } = (event as CustomEvent<MySelectValueChangeDetail>).detail;
  selectedRole.textContent = `選択中の役割: ${value ? labelOf(roleOptions, value) : "なし"}`;
  updateViews();
});

function updateInputState() {
  if (inputState) {
    inputState.textContent = `名前: ${displayName} / 通知: ${subscribed ? "オン" : "オフ"}`;
  }
}

input.addEventListener("value-change", (event) => {
  displayName = (event as CustomEvent<MyInputValueChangeDetail>).detail.value;
  updateInputState();
  updateViews();
});

updates.addEventListener("checked-change", (event) => {
  subscribed = (event as CustomEvent<MyCheckboxCheckedChangeDetail>).detail
    .checked;
  updateInputState();
  updateViews();
});

disableInputs.addEventListener("checked-change", (event) => {
  const { checked } = (event as CustomEvent<MyCheckboxCheckedChangeDetail>)
    .detail;
  input.disabled = checked;
  select.disabled = checked;
  updates.disabled = checked;
});

reset.addEventListener("click", () => {
  displayName = "花子";
  subscribed = false;
  input.value = displayName;
  input.disabled = false;
  select.value = "reader";
  select.disabled = false;
  selectedRole.textContent = `選択中の役割: ${labelOf(roleOptions, "reader")}`;
  updates.checked = false;
  updates.disabled = false;
  disableInputs.checked = false;
  updateInputState();
  updateViews();
});

const tabs = document.querySelector("my-tabs");
const dialog = document.querySelector("my-dialog");
const selectedView = document.getElementById("selected-view");
const profileSummary = document.getElementById("profile-summary");
const roleSummary = document.getElementById("role-summary");
const updatesSummary = document.getElementById("updates-summary");
const profileName = document.querySelector<HTMLInputElement>("#profile-name");
const dialogState = document.getElementById("dialog-state");
const openDialog = document.getElementById("open-dialog");
const closeDialog = document.getElementById("close-dialog");
const resetView = document.getElementById("reset-view");
if (
  !tabs ||
  !dialog ||
  !selectedView ||
  !profileSummary ||
  !roleSummary ||
  !updatesSummary ||
  !profileName ||
  !dialogState ||
  !openDialog ||
  !closeDialog ||
  !resetView
) {
  throw new Error("Demo view elements not found");
}

tabs.items = tabItems;
tabs.addEventListener("value-change", (event) => {
  const { value } = (event as CustomEvent<MyTabsValueChangeDetail>).detail;
  selectedView.textContent = `表示中のタブ: ${labelOf(tabItems, value)}`;
});
resetView.addEventListener("click", () => {
  tabs.value = "overview";
  selectedView.textContent = `表示中のタブ: ${labelOf(tabItems, "overview")}`;
});

const updateViews = () => {
  profileSummary.textContent = `プロフィール: ${displayName}`;
  roleSummary.textContent = `役割: ${select.value ? labelOf(roleOptions, select.value) : "なし"}`;
  updatesSummary.textContent = `通知: ${subscribed ? "オン" : "オフ"}`;
  profileName.value = displayName;
};

openDialog.addEventListener("click", () => {
  dialog.open = true;
  dialogState.textContent = "ダイアログ: 開いています";
});
closeDialog.addEventListener("click", () => {
  dialog.open = false;
  dialogState.textContent = "ダイアログ: 閉じています";
});
dialog.addEventListener("open-change", (event) => {
  const { open } = (event as CustomEvent<MyDialogOpenChangeDetail>).detail;
  dialogState.textContent = `ダイアログ: ${open ? "開いています" : "閉じています"}`;
});
profileName.addEventListener("input", () => {
  displayName = profileName.value;
  input.value = displayName;
  updateInputState();
  updateViews();
});
dialog.hidden = false;

const main = document.querySelector("main");
const theme = document.querySelector<HTMLSelectElement>("#theme");
const saveButton = document.querySelector<MyButton>("my-button#save-button");
const failSave = document.querySelector<MyCheckbox>("my-checkbox#fail-save");
const saveState = document.getElementById("save-state");
if (!theme || !saveButton || !failSave || !saveState)
  throw new Error("Theme and async sample elements not found");
mountThemeControl(theme);
saveButton.addEventListener("count-change", async () => {
  if (saveButton.loading) return;
  saveButton.loading = true;
  failSave.disabled = true;
  saveState.textContent = "保存: 保存中";
  try {
    await saveDemo(failSave.checked);
    saveState.textContent = "保存: 保存済み";
  } catch {
    saveState.textContent = "保存: 失敗";
  } finally {
    saveButton.loading = false;
    failSave.disabled = false;
  }
});
setupFormSample();
if (main) main.dataset.ready = "true";
