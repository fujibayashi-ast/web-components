import { createWrapper } from "#vue/create-wrapper";
import { MyCheckbox as MyCheckboxElement } from "#web-components";
import type {
  MyCheckboxEventMap,
  MyCheckboxProps,
} from "#web-components/checkbox/types";

export const MyCheckbox = createWrapper<MyCheckboxProps, MyCheckboxEventMap>(
  MyCheckboxElement,
);
