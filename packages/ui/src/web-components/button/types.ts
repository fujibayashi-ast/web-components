/**
 * Public contract for <my-button>.
 *
 * This file is intentionally free of decorators so it can be imported by
 * toolchains that only run a plain TS/Babel parser (e.g. Vue's `defineProps`
 * type resolution).
 */

export interface MyButtonProps {
  /** Name rendered in the label. */
  name?: string;
  label?: string;
  /** Current click count. */
  count?: number;
  loading?: boolean;
  disabled?: boolean;
  /**
   * Extra classes merged onto the inner `<button>`. Conflicts with the
   * component's own utilities are resolved with `tailwind-merge`, so e.g.
   * `buttonClass="bg-red-500"` reliably wins over the default `bg-blue-500`.
   *
   * `class` / `className` on the wrapper itself lands on the host
   * `<my-button>` element instead (useful for layout: margin, width, …).
   */
  buttonClass?: string;
}

/** `detail` payload of the `count-change` event. */
export interface MyButtonCountChangeDetail {
  count: number;
}

/** Events emitted by <my-button>, keyed by event type. */
export interface MyButtonEventMap {
  "count-change": CustomEvent<MyButtonCountChangeDetail>;
}
