import { createWrapper } from "#react/create-wrapper";
import {
  MyDialog as MyDialogElement,
  type MyDialogEventMap,
} from "#web-components";

export type {
  MyDialogEventMap,
  MyDialogOpenChangeDetail,
  MyDialogProps,
} from "#web-components";

export const MyDialog = createWrapper<MyDialogElement, MyDialogEventMap>(
  MyDialogElement,
);
