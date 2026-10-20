import { createFocusTrap, type FocusTrap } from "focus-trap";
import { css, html, LitElement } from "lit";
import type {
  MyDialogEventMap,
  MyDialogOpenChangeDetail,
  MyDialogProps,
} from "./types";

export type {
  MyDialogEventMap,
  MyDialogOpenChangeDetail,
  MyDialogProps,
} from "./types";

export class MyDialog extends LitElement implements MyDialogProps {
  static tagName = "my-dialog" as const;
  static eventNames = [
    "open-change",
  ] as const satisfies readonly (keyof MyDialogEventMap)[];

  static override properties = {
    label: { type: String },
    open: { type: Boolean },
  };

  static override styles = css`
    :host {
      display: contents;
      font: inherit;
    }
    dialog {
      box-sizing: border-box;
      width: min(28rem, calc(100% - 2rem));
      max-height: calc(100% - 2rem);
      padding: 1.25rem;
      border: 1px solid var(--my-dialog-border-color, #6b7280);
      border-radius: 0.5rem;
      background: var(--my-dialog-background, Canvas);
      color: var(--my-dialog-color, CanvasText);
      font: inherit;
    }
    dialog::backdrop {
      background: var(--my-dialog-backdrop, rgb(0 0 0 / 45%));
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    h2 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }
    button {
      flex: none;
      padding: 0.25rem 0.5rem;
      border: 1px solid var(--my-dialog-border-color, #6b7280);
      border-radius: 0.25rem;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid var(--my-dialog-accent, #0284c7);
      outline-offset: 2px;
    }
  `;

  label = "Dialog";
  open = false;
  #focusTrap?: FocusTrap;

  override connectedCallback() {
    super.connectedCallback();
    this.requestUpdate();
  }

  override disconnectedCallback() {
    this.#focusTrap?.deactivate();
    this.#focusTrap = undefined;
    this.renderRoot?.querySelector("dialog")?.close();
    super.disconnectedCallback();
  }

  protected override render() {
    return html`
      <dialog part="dialog" aria-labelledby="dialog-title" @cancel=${this.#onCancel} @close=${this.#onClose}>
        <header>
          <h2 id="dialog-title" part="heading">${this.label}</h2>
          <button type="button" part="close-button" @click=${this.#close}>閉じる</button>
        </header>
        <slot></slot>
      </dialog>
    `;
  }

  protected override updated() {
    const dialog = this.renderRoot.querySelector("dialog");
    if (!dialog?.isConnected) return;
    if (this.open && !dialog.open) {
      dialog.showModal();
      this.#focusTrap ??= createFocusTrap(this, {
        document: this.ownerDocument,
        delayInitialFocus: false,
        escapeDeactivates: false,
        returnFocusOnDeactivate: false,
        tabbableOptions: { getShadowRoot: (node) => node.shadowRoot ?? false },
      });
      this.#focusTrap.activate();
    }
    if (!this.open && dialog.open) {
      this.#focusTrap?.deactivate();
      dialog.close();
    }
  }

  #close = () => {
    this.#focusTrap?.deactivate();
    this.renderRoot.querySelector("dialog")?.close();
  };

  #onCancel = () => {
    this.#focusTrap?.deactivate();
  };

  #onClose = () => {
    if (this.renderRoot.querySelector("dialog")?.open) return;
    this.#focusTrap?.deactivate();
    if (!this.open || !this.isConnected) return;
    this.open = false;
    this.dispatchEvent(
      new CustomEvent<MyDialogOpenChangeDetail>("open-change", {
        detail: { open: false },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get(MyDialog.tagName)
) {
  customElements.define(MyDialog.tagName, MyDialog);
}

declare global {
  interface HTMLElementTagNameMap {
    "my-dialog": MyDialog;
  }
}
