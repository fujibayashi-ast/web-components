<script setup lang="ts">
import {
  MyButton,
  type MyButtonCountChangeDetail,
  MyCard,
  MyCheckbox,
  MyDialog,
  MyInput,
  MySelect,
  MyTabs,
} from "@web-components/ui/vue";
import { onMounted, onUnmounted, ref } from "vue";
import { type SaveState, saveDemo, saveLabels } from "../../async-demo";
import { labelOf, roleOptions, tabItems } from "../../demo-options";
import { mountThemeControl } from "../../theme";
import FormSample from "./components/FormSample.vue";

const count = ref(0);
const displayName = ref("花子");
const updates = ref(false);
const role = ref("reader");
const disabled = ref(false);
const ready = ref(false);
const view = ref("overview");
const dialogOpen = ref(false);
const loading = ref(false);
const failSave = ref(false);
const saveState = ref<SaveState>("idle");
let disposeTheme: (() => void) | undefined;

onMounted(() => {
  const select = document.querySelector<HTMLSelectElement>("#theme");
  if (select) disposeTheme = mountThemeControl(select);
  ready.value = true;
});
onUnmounted(() => disposeTheme?.());

async function save() {
  if (loading.value) return;
  loading.value = true;
  saveState.value = "saving";
  try {
    await saveDemo(failSave.value);
    saveState.value = "saved";
  } catch {
    saveState.value = "failed";
  } finally {
    loading.value = false;
  }
}

function onCountChange(detail: MyButtonCountChangeDetail) {
  count.value = detail.count;
}

function resetInputs() {
  displayName.value = "花子";
  updates.value = false;
  role.value = "reader";
  disabled.value = false;
}
</script>

<template>
  <main :data-ready="ready" class="demo-page">
    <header class="demo-header">
      <div>
        <h1 class="text-xl font-bold">Web Components</h1>
        <p class="demo-description">
          Lit で書いた 1 組のコンポーネントを、React・Vue・素の HTML
          から使うサンプルです。
        </p>
      </div>
      <label class="theme-control" for="theme">
        テーマ
        <select id="theme" :disabled="!ready">
          <option value="system">システム</option>
          <option value="light">ライト</option>
          <option value="dark">ダーク</option>
        </select>
      </label>
    </header>
    <section aria-labelledby="button-samples" class="demo-section">
      <h2 id="button-samples">
        ボタン <code class="demo-tag">my-button</code>
      </h2>
      <p class="demo-description">
        クリック回数を数え、count-change イベントを送ります。内側のボタンは
        Tailwind のクラスで上書きできます。
      </p>
      <div class="demo-actions">
        <MyButton name="デモ" @count-change="onCountChange" />
        <MyButton
          name="カスタム"
          class="w-64"
          button-class="w-full bg-emerald-600 hover:bg-emerald-700"
          @count-change="onCountChange"
        />
      </div>
      <p class="demo-status">親が受け取った回数: {{ count }}</p>
    </section>
    <section aria-labelledby="async-action" class="demo-section">
      <h2 id="async-action">
        非同期アクション <code class="demo-tag">my-button</code>
      </h2>
      <p class="demo-description">
        保存に時間がかかる想定のローディングボタン。チェックを入れると保存が失敗します。
      </p>
      <MyButton
        label="変更を保存"
        button-class="w-48"
        :loading="loading"
        :disabled="!ready"
        @count-change="save"
      />
      <MyCheckbox
        label="保存を失敗させる"
        :checked="failSave"
        :disabled="loading || !ready"
        @checked-change="failSave = $event.checked"
      />
      <p data-testid="save-state" aria-live="polite" class="demo-status">
        保存: {{ saveLabels[saveState] }}
      </p>
    </section>
    <section aria-labelledby="card-samples" class="demo-section">
      <h2 id="card-samples">カード <code class="demo-tag">my-card</code></h2>
      <p class="demo-description">
        渡した中身を Shadow DOM のスロットに表示します。
      </p>
      <MyCard label="スロットの内容">
        <p>この段落はカードのスロットに差し込まれています。</p>
        <p>スロット内のカウント: {{ count }}</p>
      </MyCard>
    </section>
    <section aria-labelledby="dialog-samples" class="demo-section">
      <h2 id="dialog-samples">
        ダイアログ <code class="demo-tag">my-dialog</code>
      </h2>
      <p class="demo-description">
        ページから開くモーダル。Esc キーか「完了」ボタンで閉じます。
      </p>
      <div class="demo-row">
        <p aria-live="polite" class="demo-status">
          ダイアログ: {{ dialogOpen ? "開いています" : "閉じています" }}
        </p>
        <button
          type="button"
          :disabled="!ready"
          class="demo-button"
          @click="dialogOpen = true"
        >
          プロフィールを編集
        </button>
      </div>
      <MyDialog
        label="プロフィールを編集"
        :open="dialogOpen"
        :hidden="!ready"
        @open-change="dialogOpen = $event.open"
      >
        <div class="flex flex-col gap-3">
          <label class="flex flex-col gap-1 text-sm">
            プロフィール名
            <input v-model="displayName" class="demo-native-input">
          </label>
          <button
            type="button"
            class="demo-button self-end"
            @click="dialogOpen = false"
          >
            完了
          </button>
        </div>
      </MyDialog>
    </section>
    <section
      aria-labelledby="tabs-samples"
      class="demo-section demo-section-wide"
    >
      <h2 id="tabs-samples">タブ <code class="demo-tag">my-tabs</code></h2>
      <p class="demo-description">
        パネルは value で対応づけます。履歴タブは無効です。
      </p>
      <MyTabs
        label="プロフィール表示"
        :value="view"
        :items="tabItems"
        @value-change="view = $event.value"
      >
        <div slot="overview">
          <p>プロフィール: {{ displayName }}</p>
          <p>役割: {{ role ? labelOf(roleOptions, role) : "なし" }}</p>
        </div>
        <div slot="preferences">
          <p>通知: {{ updates ? "オン" : "オフ" }}</p>
        </div>
        <div slot="history"><p>履歴はありません</p></div>
      </MyTabs>
      <div class="demo-row">
        <p aria-live="polite" class="demo-status">
          表示中のタブ: {{ labelOf(tabItems, view) }}
        </p>
        <button
          type="button"
          :disabled="!ready"
          class="demo-button"
          @click="view = 'overview'"
        >
          表示をリセット
        </button>
      </div>
    </section>
    <section aria-labelledby="input-samples" class="demo-section">
      <h2 id="input-samples">
        入力部品 <code class="demo-tag">my-input</code>
        <code class="demo-tag">my-select</code>
        <code class="demo-tag">my-checkbox</code>
      </h2>
      <p class="demo-description">
        入力部品の組み合わせ。状態はページ側で持ち、変更イベントを受け取ります。
      </p>
      <MyInput
        label="表示名"
        :value="displayName"
        placeholder="名前を入力"
        :disabled="disabled || !ready"
        @value-change="displayName = $event.value"
      />
      <MySelect
        label="役割"
        :value="role"
        :options="roleOptions"
        :disabled="disabled || !ready"
        @value-change="role = $event.value"
      />
      <p aria-live="polite" class="demo-status">
        選択中の役割: {{ role ? labelOf(roleOptions, role) : "なし" }}
      </p>
      <MyCheckbox
        label="更新を受け取る"
        :checked="updates"
        :disabled="disabled || !ready"
        @checked-change="updates = $event.checked"
      />
      <p role="status" class="demo-status">
        名前: {{ displayName }} / 通知: {{ updates ? "オン" : "オフ" }}
      </p>
      <div class="demo-row">
        <MyCheckbox
          label="入力を無効にする"
          :checked="disabled"
          :disabled="!ready"
          @checked-change="disabled = $event.checked"
        />
        <button
          type="button"
          :disabled="!ready"
          class="demo-button"
          @click="resetInputs"
        >
          入力をリセット
        </button>
      </div>
    </section>
    <FormSample :ready="ready" />
  </main>
</template>
