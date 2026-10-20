import { css, html, LitElement } from "lit";
import { live } from "lit/directives/live.js";
import { controlErrorStyles, controlHostStyles } from "../shared-styles";
import type {
  MyCheckboxCheckedChangeDetail,
  MyCheckboxEventMap,
  MyCheckboxProps,
} from "./types";

export type {
  MyCheckboxCheckedChangeDetail,
  MyCheckboxEventMap,
  MyCheckboxProps,
} from "./types";

export class MyCheckbox extends LitElement implements MyCheckboxProps {
  static tagName = "my-checkbox" as const;
  static eventNames = [
    "checked-change",
  ] as const satisfies readonly (keyof MyCheckboxEventMap)[];

  static override properties = {
    label: { type: String },
    checked: { type: Boolean },
    disabled: { type: Boolean },
    error: { type: String },
  };

  static override styles = [
    controlHostStyles,
    controlErrorStyles,
    css`
    label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }
    input {
      flex: none;
      width: 1rem;
      height: 1rem;
      margin: 0;
      accent-color: var(--my-checkbox-accent, #0284c7);
    }
    input:focus-visible {
      outline: 2px solid var(--my-checkbox-accent, #0284c7);
      outline-offset: 2px;
    }
    label:has(input:disabled) {
      cursor: not-allowed;
      opacity: 0.5;
    }
  `,
  ];

  label = "Option";
  checked = false;
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
        <input
          part="input"
          type="checkbox"
          .checked=${live(this.checked)}
          ?disabled=${this.disabled}
          aria-invalid=${Boolean(this.error)}
          aria-describedby=${this.error ? "error" : ""}
          @change=${this.#onChange}
        />
        <span part="label">${this.label}</span>
      </label>
      <div class="error-space">${this.error ? html`<p id="error" part="error" role="alert">${this.error}</p>` : null}</div>
    `;
  }

  #onChange = (event: Event) => {
    this.checked = (event.currentTarget as HTMLInputElement).checked;
    this.dispatchEvent(
      new CustomEvent<MyCheckboxCheckedChangeDetail>("checked-change", {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get(MyCheckbox.tagName)
) {
  customElements.define(MyCheckbox.tagName, MyCheckbox);
}

declare global {
  interface HTMLElementTagNameMap {
    "my-checkbox": MyCheckbox;
  }
}
