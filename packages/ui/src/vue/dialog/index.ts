import { createWrapper } from "#vue/create-wrapper";
import { MyDialog as MyDialogElement } from "#web-components";
import type {
  MyDialogEventMap,
  MyDialogProps,
} from "#web-components/dialog/types";

export const MyDialog = createWrapper<MyDialogProps, MyDialogEventMap>(
  MyDialogElement,
);
