import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { useArgs, useState } from "storybook/preview-api";
import { fn } from "storybook/test";
import {
  MyImageUploader,
  type MyImageUploaderEventMap,
  type MyImageUploaderProps,
} from "../web-components/image-uploader";

type Args = MyImageUploaderProps & {
  onFilesChange: (event: MyImageUploaderEventMap["files-change"]) => void;
  onFilesReject: (event: MyImageUploaderEventMap["files-reject"]) => void;
};

const meta = {
  title: "Components/Image Uploader",
  component: MyImageUploader.tagName,
  tags: ["autodocs"],
  render: function Render(args, context) {
    const [, updateArgs] = useArgs<Args>();
    const [files, setFiles] = useState<readonly File[]>(
      context.loaded.files ?? args.files ?? [],
    );
    return html`
      <my-image-uploader
        .label=${args.label}
        .files=${files}
        .allowedTypes=${args.allowedTypes}
        .maxFiles=${args.maxFiles}
        .maxBytes=${args.maxBytes}
        .disabled=${args.disabled}
        .error=${args.error}
        @files-change=${(event: MyImageUploaderEventMap["files-change"]) => {
          args.onFilesChange(event);
          setFiles(event.detail.files);
          updateArgs({ error: "" });
        }}
        @files-reject=${(event: MyImageUploaderEventMap["files-reject"]) => {
          args.onFilesReject(event);
          updateArgs({ error: event.detail.message });
        }}
      ></my-image-uploader>
    `;
  },
  argTypes: {
    label: { control: "text" },
    files: { control: false },
    allowedTypes: { control: "object" },
    maxFiles: { control: { type: "number", min: 1, step: 1 } },
    maxBytes: { control: { type: "number", min: 1, step: 1024 } },
    disabled: { control: "boolean" },
    error: { control: "text" },
    onFilesChange: { control: false },
    onFilesReject: { control: false },
  },
  args: {
    label: "プロフィール画像",
    files: [],
    allowedTypes: ["image/png", "image/jpeg", "image/webp"],
    maxFiles: 3,
    maxBytes: 2 * 1024 * 1024,
    disabled: false,
    error: "",
    onFilesChange: fn(),
    onFilesReject: fn(),
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};
export const WithImages: Story = {
  loaders: [
    async () => {
      const response = await fetch(
        new URL("./assets/styling.png", import.meta.url).href,
      );
      if (!response.ok) throw new Error("サンプル画像を読み込めませんでした。");
      return {
        files: [
          new File([await response.blob()], "sample.png", {
            type: "image/png",
          }),
        ],
      };
    },
  ],
};
export const ValidationError: Story = {
  name: "Error",
  args: { error: "画像を 1 枚以上選択してください。" },
};
export const Disabled: Story = { args: { disabled: true } };
export const SingleImage: Story = { args: { maxFiles: 1 } };
