import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import {
  MyDialog,
  type MyDialogEventMap,
  type MyDialogProps,
} from "../web-components/dialog";

type Args = MyDialogProps & {
  onOpenChange: (event: MyDialogEventMap["open-change"]) => void;
};

const meta = {
  title: "Components/Dialog",
  component: MyDialog.tagName,
  tags: ["autodocs"],
  render: function Render(args) {
    const [, updateArgs] = useArgs<Args>();
    return html`
      <button
        type="button"
        class="rounded border px-3 py-2"
        .disabled=${args.open}
        @click=${() => updateArgs({ open: true })}
      >
        プロフィールを編集
      </button>
      <my-dialog
        .label=${args.label}
        .open=${args.open}
        @open-change=${(event: MyDialogEventMap["open-change"]) => {
          args.onOpenChange(event);
          updateArgs({ open: event.detail.open });
        }}
      >
        <p class="mb-4">花子さんのプロフィールを保存しますか？</p>
        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded border px-3 py-2"
            @click=${() => updateArgs({ open: false })}
          >
            キャンセル
          </button>
          <button
            type="button"
            class="rounded border px-3 py-2"
            @click=${() => updateArgs({ open: false })}
          >
            保存する
          </button>
        </div>
      </my-dialog>
    `;
  },
  argTypes: {
    label: { control: "text" },
    open: { control: "boolean" },
    onOpenChange: { control: false },
  },
  args: {
    label: "変更の確認",
    open: false,
    onOpenChange: fn(),
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};
export const LongLabel: Story = {
  args: { label: "アカウント情報とアクセス権限の変更内容を確認してください" },
};
