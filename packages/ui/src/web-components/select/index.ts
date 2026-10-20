import { css, html, LitElement } from "lit";
import { live } from "lit/directives/live.js";
import {
  controlErrorStyles,
  controlHostStyles,
  controlLabelStyles,
} from "../shared-styles";
import type {
  MySelectEventMap,
  MySelectOption,
  MySelectProps,
  MySelectValueChangeDetail,
} from "./types";

export type {
  MySelectEventMap,
  MySelectOption,
  MySelectProps,
  MySelectValueChangeDetail,
} from "./types";

export class MySelect extends LitElement implements MySelectProps {
  static tagName = "my-select" as const;
  static eventNames = [
    "value-change",
  ] as const satisfies readonly (keyof MySelectEventMap)[];

  static override properties = {
    label: { type: String },
    value: { type: String },
    options: { attribute: false },
    placeholder: { type: String },
    disabled: { type: Boolean },
    error: { type: String },
  };

  static override styles = [
    controlHostStyles,
    controlLabelStyles,
    controlErrorStyles,
    css`
    select {
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--my-select-border-color, #6b7280);
      border-radius: 0.25rem;
      background: transparent;
      color: inherit;
      font: inherit;
    }
    select:focus-visible {
      outline: 2px solid var(--my-select-accent, #0284c7);
      outline-offset: 2px;
    }
    select:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    select[aria-invalid="true"] {
      border-color: var(--my-control-error-color, #dc2626);
    }
  `,
  ];

  label = "Choice";
  value = "";
  options: readonly MySelectOption[] = [];
  placeholder = "選択してください";
  disabled = false;
  error = "";

  override focus(options?: FocusOptions) {
    this.renderRoot?.querySelector("select")?.focus(options);
  }

  override blur() {
    this.renderRoot?.querySelector("select")?.blur();
  }

  protected override render() {
    return html`
      <label>
        <span part="label">${this.label}</span>
        <select
          part="select"
          ?disabled=${this.disabled}
          aria-invalid=${Boolean(this.error)}
          aria-describedby=${this.error ? "error" : ""}
          @change=${this.#onChange}
        >
          <option value="" .selected=${live(this.value === "")}>${this.placeholder}</option>
          ${this.options.map(
            (option) => html`
            <option
              value=${option.value}
              ?disabled=${option.disabled}
              .selected=${live(option.value === this.value)}
            >${option.label}</option>
          `,
          )}
        </select>
      </label>
      <div class="error-space">${this.error ? html`<p id="error" part="error" role="alert">${this.error}</p>` : null}</div>
    `;
  }

  #onChange = (event: Event) => {
    this.value = (event.currentTarget as HTMLSelectElement).value;
    this.dispatchEvent(
      new CustomEvent<MySelectValueChangeDetail>("value-change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get(MySelect.tagName)
) {
  customElements.define(MySelect.tagName, MySelect);
}

declare global {
  interface HTMLElementTagNameMap {
    "my-select": MySelect;
  }
}
