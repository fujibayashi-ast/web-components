import { createWrapper } from "#react/create-wrapper";
import {
  MyButton as MyButtonElement,
  type MyButtonEventMap,
} from "#web-components";

export type {
  MyButtonCountChangeDetail,
  MyButtonEventMap,
  MyButtonProps,
} from "#web-components";

/**
 * React wrapper for <my-button>.
 *
 * ```tsx
 * <MyButton name="Ada" onCountChange={(e) => console.log(e.detail.count)} />
 * ```
 */
export const MyButton = createWrapper<MyButtonElement, MyButtonEventMap>(
  MyButtonElement,
);
