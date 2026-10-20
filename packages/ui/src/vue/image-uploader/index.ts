import { createWrapper } from "#vue/create-wrapper";
import { MyImageUploader as MyImageUploaderElement } from "#web-components";
import type {
  MyImageUploaderEventMap,
  MyImageUploaderProps,
} from "#web-components/image-uploader/types";

export const MyImageUploader = createWrapper<
  MyImageUploaderProps,
  MyImageUploaderEventMap
>(MyImageUploaderElement);
