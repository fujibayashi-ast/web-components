import { createWrapper } from "#vue/create-wrapper";
import { MyButton as MyButtonElement } from "#web-components";
import type {
  MyButtonEventMap,
  MyButtonProps,
} from "#web-components/button/types";

export const MyButton = createWrapper<MyButtonProps, MyButtonEventMap>(
  MyButtonElement,
);
