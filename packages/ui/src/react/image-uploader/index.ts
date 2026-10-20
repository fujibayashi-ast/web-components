import { createWrapper } from "#react/create-wrapper";
import {
  MyImageUploader as MyImageUploaderElement,
  type MyImageUploaderEventMap,
} from "#web-components";

export type {
  MyImageUploaderEventMap,
  MyImageUploaderFilesChangeDetail,
  MyImageUploaderFilesRejectDetail,
  MyImageUploaderProps,
} from "#web-components";

export const MyImageUploader = createWrapper<
  MyImageUploaderElement,
  MyImageUploaderEventMap
>(MyImageUploaderElement);
