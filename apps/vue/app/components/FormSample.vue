<script setup lang="ts">
import {
  MyCheckbox,
  MyImageUploader,
  MyInput,
  MySelect,
} from "@web-components/ui/vue";
import { useField, useForm } from "vee-validate";
import { nextTick, ref } from "vue";
import {
  createFormDefaults,
  formRoles,
  formValidators,
  type ProfileFormValues,
  serializeSubmission,
} from "../../../form-demo";

defineProps<{ ready: boolean }>();

const { handleSubmit, resetForm, isSubmitting, submitCount } =
  useForm<ProfileFormValues>({ initialValues: createFormDefaults() });
const name = useField<string>("name", formValidators.name, {
  validateOnValueUpdate: false,
});
const role = useField<string>("role", formValidators.role, {
  validateOnValueUpdate: false,
});
const consent = useField<boolean>("consent", formValidators.consent, {
  validateOnValueUpdate: false,
});
const images = useField<File[]>("images", formValidators.images, {
  validateOnValueUpdate: false,
});
const nameValue = name.value;
const roleValue = role.value;
const consentValue = consent.value;
const imageValue = images.value;
const nameError = name.errorMessage;
const roleError = role.errorMessage;
const consentError = consent.errorMessage;
const imageError = images.errorMessage;
const submission = ref("まだ送信されていません");
const form = ref<HTMLFormElement>();

const submit = handleSubmit(
  (values) => {
    submission.value = serializeSubmission(values);
  },
  async ({ errors }) => {
    await nextTick();
    for (const field of ["name", "role", "consent", "images"] as const) {
      if (errors[field]) {
        form.value
          ?.querySelector<HTMLElement>(`[data-field="${field}"]`)
          ?.focus();
        break;
      }
    }
  },
);

function reset() {
  resetForm({ values: createFormDefaults() });
  submission.value = "まだ送信されていません";
}
</script>

<template>
  <form
    ref="form"
    aria-label="プロフィールフォーム"
    novalidate
    class="demo-section"
    @submit.prevent="submit"
    @reset.prevent="reset"
  >
    <h2>フォーム <code class="demo-tag">my-image-uploader</code></h2>
    <p class="demo-description">
      フォーカスを外したときと送信時に検証します。リセットで初期値に戻ります。
    </p>
    <MyInput
      data-field="name"
      label="アカウント名"
      :value="nameValue"
      :disabled="!ready"
      :error="nameError ?? ''"
      @value-change="name.handleChange($event.value, submitCount > 0)"
      @focusout="name.handleBlur($event, true)"
    />
    <MySelect
      data-field="role"
      label="アクセス権限"
      :value="roleValue"
      :options="formRoles"
      :disabled="!ready"
      :error="roleError ?? ''"
      @value-change="role.handleChange($event.value, submitCount > 0)"
      @focusout="role.handleBlur($event, true)"
    />
    <MyCheckbox
      data-field="consent"
      label="利用規約に同意する"
      :checked="consentValue"
      :disabled="!ready"
      :error="consentError ?? ''"
      @checked-change="consent.handleChange($event.checked, submitCount > 0)"
      @focusout="consent.handleBlur($event, true)"
    />
    <MyImageUploader
      data-field="images"
      label="プロフィール画像"
      :files="imageValue"
      :disabled="!ready"
      :error="imageError ?? ''"
      @files-change="images.handleChange($event.files, submitCount > 0)"
      @focusout="images.handleBlur($event, true)"
    />
    <div class="demo-actions">
      <button
        type="submit"
        :disabled="!ready || isSubmitting"
        class="demo-button"
      >
        プロフィールを送信
      </button>
      <button
        type="reset"
        :disabled="!ready || isSubmitting"
        class="demo-button"
      >
        フォームをリセット
      </button>
    </div>
    <p data-testid="form-result" aria-live="polite" class="demo-status">
      {{ submission }}
    </p>
  </form>
</template>
