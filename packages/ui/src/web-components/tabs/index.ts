import { css, html, LitElement } from "lit";
import { controlHostStyles } from "../shared-styles";
import type {
  MyTab,
  MyTabsEventMap,
  MyTabsProps,
  MyTabsValueChangeDetail,
} from "./types";

export type {
  MyTab,
  MyTabsEventMap,
  MyTabsProps,
  MyTabsValueChangeDetail,
} from "./types";

export class MyTabs extends LitElement implements MyTabsProps {
  static tagName = "my-tabs" as const;
  static eventNames = [
    "value-change",
  ] as const satisfies readonly (keyof MyTabsEventMap)[];

  static override properties = {
    label: { type: String },
    value: { type: String },
    items: { attribute: false },
  };

  static override styles = [
    controlHostStyles,
    css`
      [role="tablist"] {
        display: flex;
        overflow-x: auto;
        border-bottom: 1px solid var(--my-tabs-border-color, #6b7280);
      }
      button {
        flex: none;
        padding: 0.5rem 0.75rem;
        border: 0;
        border-bottom: 2px solid transparent;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
      }
      button[aria-selected="true"] {
        border-bottom-color: var(--my-tabs-accent, #0284c7);
        font-weight: 600;
      }
      button:focus-visible {
        outline: 2px solid var(--my-tabs-accent, #0284c7);
        outline-offset: -2px;
      }
      button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
      [role="tabpanel"] {
        min-height: 3rem;
        padding-top: 0.75rem;
      }
    `,
  ];

  label = "Views";
  value = "";
  items: readonly MyTab[] = [];

  protected override render() {
    const selected =
      this.items.find((item) => !item.disabled && item.value === this.value) ??
      this.items.find((item) => !item.disabled);
    return html`
      <div role="tablist" aria-label=${this.label} aria-orientation="horizontal">
        ${this.items.map(
          (item, index) => html`
          <button
            id=${`tab-${index}`}
            part="tab"
            type="button"
            role="tab"
            aria-controls=${`panel-${index}`}
            aria-selected=${item === selected}
            tabindex=${item === selected ? 0 : -1}
            ?disabled=${item.disabled}
            @click=${() => this.#select(item)}
            @keydown=${(event: KeyboardEvent) => this.#onKeyDown(event, item.value)}
          >${item.label}</button>
        `,
        )}
      </div>
      ${this.items.map(
        (item, index) => html`
        <section
          id=${`panel-${index}`}
          part="panel"
          role="tabpanel"
          aria-labelledby=${`tab-${index}`}
          tabindex="0"
          ?hidden=${item !== selected}
        ><slot name=${item.value}></slot></section>
      `,
      )}
    `;
  }

  #select(item: MyTab) {
    if (item.disabled || this.value === item.value) return;
    this.value = item.value;
    this.dispatchEvent(
      new CustomEvent<MyTabsValueChangeDetail>("value-change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  async #onKeyDown(event: KeyboardEvent, value: string) {
    const enabled = this.items.filter((item) => !item.disabled);
    if (!enabled.length) return;
    const index = enabled.findIndex((item) => item.value === value);
    let next: MyTab | undefined;
    if (event.key === "Home") next = enabled[0];
    else if (event.key === "End") next = enabled.at(-1);
    else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const step =
        getComputedStyle(this).direction === "rtl" ? -direction : direction;
      next = enabled[(index + step + enabled.length) % enabled.length];
    }
    if (!next) return;
    event.preventDefault();
    this.#select(next);
    await this.updateComplete;
    this.renderRoot
      .querySelector<HTMLButtonElement>('button[aria-selected="true"]')
      ?.focus();
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get(MyTabs.tagName)
) {
  customElements.define(MyTabs.tagName, MyTabs);
}

declare global {
  interface HTMLElementTagNameMap {
    "my-tabs": MyTabs;
  }
}
