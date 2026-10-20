import { css } from "lit";

/** `:host` shared by the form-like controls. */
export const controlHostStyles = css`
  :host {
    display: block;
    min-width: 0;
    font: inherit;
  }
`;

/** `<label>` wrapping a `<span part="label">` text, used by input and select. */
export const controlLabelStyles = css`
  label {
    display: block;
  }
  span {
    display: block;
    margin-bottom: 0.375rem;
    font-size: 0.875rem;
    font-weight: 600;
  }
`;

/** Wrapper that reserves room for the error so the layout does not shift. */
export const errorSpaceStyles = css`
  .error-space {
    min-height: var(--my-control-error-space, 0px);
  }
`;

/** Error message (`<p part="error">`) below a control. */
export const controlErrorStyles = css`
  ${errorSpaceStyles}
  p {
    margin: 0.375rem 0 0;
    color: var(--my-control-error-color, #dc2626);
    font-size: 0.875rem;
  }
`;
