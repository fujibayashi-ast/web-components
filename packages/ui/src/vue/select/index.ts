import { createWrapper } from "#vue/create-wrapper";
import { MySelect as MySelectElement } from "#web-components";
import type {
  MySelectEventMap,
  MySelectProps,
} from "#web-components/select/types";

export const MySelect = createWrapper<MySelectProps, MySelectEventMap>(
  MySelectElement,
);
