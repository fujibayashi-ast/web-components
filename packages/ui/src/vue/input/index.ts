import { createWrapper } from "#vue/create-wrapper";
import { MyInput as MyInputElement } from "#web-components";
import type {
  MyInputEventMap,
  MyInputProps,
} from "#web-components/input/types";

export const MyInput = createWrapper<MyInputProps, MyInputEventMap>(
  MyInputElement,
);
