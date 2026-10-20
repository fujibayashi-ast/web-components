import { css, html, LitElement, type PropertyValues } from "lit";
import { controlHostStyles, errorSpaceStyles } from "../shared-styles";
import type {
  MyImageUploaderEventMap,
  MyImageUploaderFilesChangeDetail,
  MyImageUploaderFilesRejectDetail,
  MyImageUploaderProps,
} from "./types";

export type {
  MyImageUploaderEventMap,
  MyImageUploaderFilesChangeDetail,
  MyImageUploaderFilesRejectDetail,
  MyImageUploaderProps,
} from "./types";

export class MyImageUploader
  extends LitElement
  implements MyImageUploaderProps
{
  static tagName = "my-image-uploader" as const;
  static eventNames = [
    "files-change",
    "files-reject",
  ] as const satisfies readonly (keyof MyImageUploaderEventMap)[];

  static override properties = {
    label: { type: String },
    files: { attribute: false },
    allowedTypes: { attribute: false },
    maxFiles: { type: Number, attribute: "max-files" },
    maxBytes: { type: Number, attribute: "max-bytes" },
    disabled: { type: Boolean },
    error: { type: String },
  };

  static override styles = [
    controlHostStyles,
    errorSpaceStyles,
    css`
      .drop-zone {
        padding: 0.75rem;
        border: 1px dashed var(--my-image-uploader-border-color, #6b7280);
        border-radius: 0.25rem;
      }
      .heading {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }
      .label {
        font-size: 0.875rem;
        font-weight: 600;
      }
      button {
        padding: 0.375rem 0.625rem;
        border: 1px solid var(--my-image-uploader-border-color, #6b7280);
        border-radius: 0.25rem;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }
      button:focus-visible {
        outline: 2px solid var(--my-image-uploader-accent, #0284c7);
        outline-offset: 2px;
      }
      button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
      .previews {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 8rem), 1fr));
        gap: 0.75rem;
        margin-top: 0.75rem;
      }
      figure {
        min-width: 0;
        margin: 0;
      }
      img {
        display: block;
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: contain;
        background: var(--my-image-uploader-background, Canvas);
      }
      figcaption {
        margin: 0.375rem 0;
        font-size: 0.875rem;
        overflow-wrap: anywhere;
      }
      p {
        margin: 0.5rem 0 0;
        font-size: 0.875rem;
      }
      .error {
        color: var(--my-control-error-color, #dc2626);
      }
    `,
  ];

  label = "Images";
  files: readonly File[] = [];
  allowedTypes: readonly string[] = ["image/png", "image/jpeg", "image/webp"];
  maxFiles = 3;
  maxBytes = 2 * 1024 * 1024;
  disabled = false;
  error = "";
  #rejection = "";
  #previews = new Map<File, string>();

  override connectedCallback() {
    super.connectedCallback();
    this.requestUpdate();
  }

  override disconnectedCallback() {
    for (const url of this.#previews.values()) URL.revokeObjectURL(url);
    this.#previews.clear();
    super.disconnectedCallback();
  }

  override focus(options?: FocusOptions) {
    this.renderRoot
      ?.querySelector<HTMLButtonElement>("#choose")
      ?.focus(options);
  }

  override blur() {
    this.renderRoot?.querySelector<HTMLButtonElement>("#choose")?.blur();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has("files")) this.#rejection = "";
    if (!this.isConnected) return;
    const files = this.files ?? [];
    for (const [file, url] of this.#previews) {
      if (!files.includes(file)) {
        URL.revokeObjectURL(url);
        this.#previews.delete(file);
      }
    }
    for (const file of files) {
      if (!this.#previews.has(file))
        this.#previews.set(file, URL.createObjectURL(file));
    }
  }

  protected override render() {
    const files = this.files ?? [];
    const error = this.#rejection || this.error;
    return html`
      <div part="drop-zone" class="drop-zone" role="group" aria-label=${`${this.label}のドロップ領域`}
        @dragover=${this.#onDragOver} @drop=${this.#onDrop}>
        <div class="heading">
          <span class="label">${this.label}</span>
          <button id="choose" part="choose-button" type="button" ?disabled=${this.disabled}
            aria-invalid=${Boolean(error)} aria-describedby=${error ? "error" : ""}
            @click=${this.#choose}>画像を選択</button>
        </div>
        <input type="file" hidden multiple accept=${(this.allowedTypes ?? []).join(",")}
          aria-label=${this.label} ?disabled=${this.disabled} @change=${this.#onChange} />
        <p>画像: ${files.length} 枚</p>
        ${
          files.length
            ? html`<div class="previews">
          ${files.map(
            (file, index) => html`<figure part="preview">
            <img src=${this.#previews.get(file) ?? ""} alt=${file.name} />
            <figcaption>${file.name}</figcaption>
            <button part="remove-button" type="button" ?disabled=${this.disabled}
              aria-label=${`${file.name} を削除`} @click=${() => this.#remove(index)}>削除</button>
          </figure>`,
          )}
        </div>`
            : null
        }
      </div>
      <div class="error-space">${error ? html`<p id="error" class="error" part="error" role="alert">${error}</p>` : null}</div>
    `;
  }

  #choose = () => {
    if (!this.disabled)
      this.renderRoot
        .querySelector<HTMLInputElement>('input[type="file"]')
        ?.click();
  };

  #onChange = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    this.#add(Array.from(input.files ?? []));
    input.value = "";
  };

  #onDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer)
      event.dataTransfer.dropEffect = this.disabled ? "none" : "copy";
  };

  #onDrop = (event: DragEvent) => {
    event.preventDefault();
    this.#add(Array.from(event.dataTransfer?.files ?? []));
  };

  #add(incoming: File[]) {
    if (this.disabled || !incoming.length) return;
    const files = [...(this.files ?? []), ...incoming];
    let message = "";
    if (files.length > this.maxFiles)
      message = `画像は最大 ${this.maxFiles} 枚までです。`;
    else if (
      incoming.some((file) => !(this.allowedTypes ?? []).includes(file.type))
    )
      message = `使用できる画像形式: ${(this.allowedTypes ?? []).join(", ")}`;
    else if (incoming.some((file) => file.size > this.maxBytes))
      message = `画像は ${this.maxBytes} バイト以下にしてください。`;
    if (message) {
      this.#rejection = message;
      this.requestUpdate();
      this.dispatchEvent(
        new CustomEvent<MyImageUploaderFilesRejectDetail>("files-reject", {
          detail: { message },
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }
    this.#setFiles(files);
  }

  #remove(index: number) {
    if (!this.disabled)
      this.#setFiles(
        (this.files ?? []).filter((_file, position) => position !== index),
      );
  }

  #setFiles(files: File[]) {
    this.files = files;
    this.dispatchEvent(
      new CustomEvent<MyImageUploaderFilesChangeDetail>("files-change", {
        detail: { files: [...files] },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get(MyImageUploader.tagName)
) {
  customElements.define(MyImageUploader.tagName, MyImageUploader);
}

declare global {
  interface HTMLElementTagNameMap {
    "my-image-uploader": MyImageUploader;
  }
}
