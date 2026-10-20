import { createWrapper } from "#react/create-wrapper";
import {
  MyInput as MyInputElement,
  type MyInputEventMap,
} from "#web-components";

export type {
  MyInputEventMap,
  MyInputProps,
  MyInputValueChangeDetail,
} from "#web-components";

export const MyInput = createWrapper<MyInputElement, MyInputEventMap>(
  MyInputElement,
);
