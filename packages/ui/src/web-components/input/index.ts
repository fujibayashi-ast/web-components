import { css, html, LitElement } from "lit";
import { live } from "lit/directives/live.js";
import {
  controlErrorStyles,
  controlHostStyles,
  controlLabelStyles,
} from "../shared-styles";
import type {
  MyInputEventMap,
  MyInputProps,
  MyInputValueChangeDetail,
} from "./types";

export type {
  MyInputEventMap,
  MyInputProps,
  MyInputValueChangeDetail,
} from "./types";

export class MyInput extends LitElement implements MyInputProps {
  static tagName = "my-input" as const;
  static eventNames = [
    "value-change",
  ] as const satisfies readonly (keyof MyInputEventMap)[];

  static override properties = {
    label: { type: String },
    value: { type: String },
    placeholder: { type: String },
    disabled: { type: Boolean },
    error: { type: String },
  };

  static override styles = [
    controlHostStyles,
    controlLabelStyles,
    controlErrorStyles,
    css`
    input {
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--my-input-border-color, #6b7280);
      border-radius: 0.25rem;
      background: transparent;
      color: inherit;
      font: inherit;
    }
    input:focus-visible {
      outline: 2px solid var(--my-input-accent, #0284c7);
      outline-offset: 2px;
    }
    input:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    input[aria-invalid="true"] {
      border-color: var(--my-control-error-color, #dc2626);
    }
  `,
  ];

  label = "Text";
  value = "";
  placeholder = "";
  disabled = false;
  error = "";

  override focus(options?: FocusOptions) {
    this.renderRoot?.querySelector("input")?.focus(options);
  }

  override blur() {
    this.renderRoot?.querySelector("input")?.blur();
  }

  protected override render() {
    return html`
      <label>
        <span part="label">${this.label}</span>
        <input
          part="input"
          type="text"
          .value=${live(this.value)}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          aria-invalid=${Boolean(this.error)}
          aria-describedby=${this.error ? "error" : ""}
          @input=${this.#onInput}
        />
      </label>
      <div class="error-space">${this.error ? html`<p id="error" part="error" role="alert">${this.error}</p>` : null}</div>
    `;
  }

  #onInput = (event: Event) => {
    this.value = (event.currentTarget as HTMLInputElement).value;
    this.dispatchEvent(
      new CustomEvent<MyInputValueChangeDetail>("value-change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get(MyInput.tagName)
) {
  customElements.define(MyInput.tagName, MyInput);
}

declare global {
  interface HTMLElementTagNameMap {
    "my-input": MyInput;
  }
}
