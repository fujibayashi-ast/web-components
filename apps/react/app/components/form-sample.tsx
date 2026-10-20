import {
  MyCheckbox,
  MyImageUploader,
  MyInput,
  MySelect,
} from "@web-components/ui/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  createFormDefaults,
  formRoles,
  formValidators,
  type ProfileFormValues,
  serializeSubmission,
} from "../../../form-demo";

export default function FormSample({ ready }: { ready: boolean }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfileFormValues>({
    defaultValues: createFormDefaults(),
    mode: "onBlur",
  });
  const [submission, setSubmission] = useState("まだ送信されていません");
  const disabled = !ready;

  return (
    <form
      aria-label="プロフィールフォーム"
      noValidate
      className="demo-section"
      onSubmit={handleSubmit((values) =>
        setSubmission(serializeSubmission(values)),
      )}
      onReset={(event) => {
        event.preventDefault();
        reset(createFormDefaults());
        setSubmission("まだ送信されていません");
      }}
    >
      <h2>
        フォーム <code className="demo-tag">my-image-uploader</code>
      </h2>
      <p className="demo-description">
        フォーカスを外したときと送信時に検証します。リセットで初期値に戻ります。
      </p>
      <Controller
        name="name"
        control={control}
        rules={{ validate: formValidators.name }}
        render={({ field, fieldState }) => (
          <MyInput
            label="アカウント名"
            value={field.value}
            ref={field.ref}
            disabled={disabled}
            error={fieldState.error?.message ?? ""}
            onValueChange={(event) => field.onChange(event.detail.value)}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        name="role"
        control={control}
        rules={{ validate: formValidators.role }}
        render={({ field, fieldState }) => (
          <MySelect
            label="アクセス権限"
            value={field.value}
            options={formRoles}
            ref={field.ref}
            disabled={disabled}
            error={fieldState.error?.message ?? ""}
            onValueChange={(event) => field.onChange(event.detail.value)}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        name="consent"
        control={control}
        rules={{ validate: formValidators.consent }}
        render={({ field, fieldState }) => (
          <MyCheckbox
            label="利用規約に同意する"
            checked={field.value}
            ref={field.ref}
            disabled={disabled}
            error={fieldState.error?.message ?? ""}
            onCheckedChange={(event) => field.onChange(event.detail.checked)}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        name="images"
        control={control}
        rules={{ validate: formValidators.images }}
        render={({ field, fieldState }) => (
          <MyImageUploader
            label="プロフィール画像"
            files={field.value}
            ref={field.ref}
            disabled={disabled}
            error={fieldState.error?.message ?? ""}
            onFilesChange={(event) => field.onChange(event.detail.files)}
            onBlur={field.onBlur}
          />
        )}
      />
      <div className="demo-actions">
        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="demo-button"
        >
          プロフィールを送信
        </button>
        <button
          type="reset"
          disabled={disabled || isSubmitting}
          className="demo-button"
        >
          フォームをリセット
        </button>
      </div>
      <p data-testid="form-result" aria-live="polite" className="demo-status">
        {submission}
      </p>
    </form>
  );
}
