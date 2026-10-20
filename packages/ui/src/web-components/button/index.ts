import { html, LitElement } from "lit";
import { twMerge } from "tailwind-merge";
import type {
  MyButtonCountChangeDetail,
  MyButtonEventMap,
  MyButtonProps,
} from "./types";

export type {
  MyButtonCountChangeDetail,
  MyButtonEventMap,
  MyButtonProps,
} from "./types";

const BASE_CLASS =
  "relative rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60";

/**
 * A small demo button.
 *
 * Written without Lit decorators: the dev-time transformer (esbuild/oxc) does
 * not lower TC39 decorators, so `static properties` + plain class fields keeps
 * this working in `vite dev` as well as the production build. Requires
 * `useDefineForClassFields: false` (set in this package's tsconfig) so the field
 * initializers don't shadow Lit's reactive accessors.
 *
 * Renders into the light DOM (`createRenderRoot` returns `this`) so the host
 * app's global stylesheet — Tailwind here — styles it. Consumers can also target
 * the inner button directly (`my-button button { … }`) or pass `buttonClass`.
 *
 * @fires count-change - `CustomEvent<MyButtonCountChangeDetail>` on every click.
 */
export class MyButton extends LitElement implements MyButtonProps {
  static tagName = "my-button" as const;
  static usesLightDom = true;

  /** DOM events wrappers should expose. Cross-checked against MyButtonEventMap. */
  static eventNames = [
    "count-change",
  ] as const satisfies readonly (keyof MyButtonEventMap)[];

  static override properties = {
    name: { type: String },
    label: { type: String },
    count: { type: Number },
    loading: { type: Boolean },
    disabled: { type: Boolean },
    buttonClass: { type: String, attribute: "button-class" },
  };

  name = "World";
  label = "";
  count = 0;
  loading = false;
  disabled = false;
  buttonClass = "";

  protected override createRenderRoot() {
    return this;
  }

  protected override render() {
    return html`
      <button
        type="button"
        ?disabled=${this.disabled || this.loading}
        aria-busy=${this.loading}
        @click=${this.#onClick}
        class=${twMerge(BASE_CLASS, this.buttonClass)}
      >
        ${this.loading ? html`<span aria-hidden="true" class="absolute left-2 top-1/2 -mt-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"></span>` : null}
        ${this.label || html`こんにちは、${this.name}！(${this.count})`}
      </button>
    `;
  }

  #onClick = () => {
    if (this.disabled || this.loading) return;
    this.count++;
    this.dispatchEvent(
      new CustomEvent<MyButtonCountChangeDetail>("count-change", {
        detail: { count: this.count },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get(MyButton.tagName)
) {
  customElements.define(MyButton.tagName, MyButton);
}

declare global {
  interface HTMLElementTagNameMap {
    "my-button": MyButton;
  }
}
