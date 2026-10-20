import { createWrapper } from "#react/create-wrapper";
import {
  MySelect as MySelectElement,
  type MySelectEventMap,
} from "#web-components";

export type {
  MySelectEventMap,
  MySelectOption,
  MySelectProps,
  MySelectValueChangeDetail,
} from "#web-components";

export const MySelect = createWrapper<MySelectElement, MySelectEventMap>(
  MySelectElement,
);
