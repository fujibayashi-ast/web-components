import { css, html, LitElement } from "lit";
import type { MyCardProps } from "./types";

export type { MyCardProps } from "./types";

/**
 * A demo card. No Lit decorators — see button/index.ts for why.
 *
 * Unlike <my-button>, this renders into a shadow root so that `<slot>` works and
 * its styles are encapsulated. The host app's Tailwind classes do NOT reach
 * inside — the component ships its own CSS. To customise from the outside, use
 * `my-card::part(heading) { … }` or the `--my-card-*` custom properties.
 *
 * @slot - Default slot for the card body.
 * @csspart heading - The `<h2>` label.
 * @cssprop [--my-card-border=1px solid #e5e7eb] - Border shorthand.
 * @cssprop [--my-card-radius=0.5rem]
 */
export class MyCard extends LitElement implements MyCardProps {
  static tagName = "my-card" as const;

  static override properties = {
    label: { type: String },
  };

  static override styles = css`
    :host {
      display: block;
      border: var(--my-card-border, 1px solid #e5e7eb);
      border-radius: var(--my-card-radius, 0.5rem);
      padding: 1rem;
      font: inherit;
    }
    h2 {
      margin: 0 0 0.5rem;
      font-size: 1rem;
      font-weight: 600;
    }
  `;

  label = "World";

  protected override render() {
    return html`
      <h2 part="heading">こんにちは、${this.label}！</h2>
      <slot></slot>
    `;
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get(MyCard.tagName)
) {
  customElements.define(MyCard.tagName, MyCard);
}

declare global {
  interface HTMLElementTagNameMap {
    "my-card": MyCard;
  }
}
