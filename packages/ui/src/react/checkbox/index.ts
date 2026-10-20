import { createWrapper } from "#react/create-wrapper";
import {
  MyCheckbox as MyCheckboxElement,
  type MyCheckboxEventMap,
} from "#web-components";

export type {
  MyCheckboxCheckedChangeDetail,
  MyCheckboxEventMap,
  MyCheckboxProps,
} from "#web-components";

export const MyCheckbox = createWrapper<MyCheckboxElement, MyCheckboxEventMap>(
  MyCheckboxElement,
);
