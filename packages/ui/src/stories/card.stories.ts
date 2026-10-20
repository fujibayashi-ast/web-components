import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { MyCard, type MyCardProps } from "../web-components/card";

type Args = MyCardProps & { content: string };

const meta = {
  title: "Components/Card",
  component: MyCard.tagName,
  tags: ["autodocs"],
  render: (args) => html`
    <my-card .label=${args.label}>
      <p>${args.content}</p>
    </my-card>
  `,
  argTypes: {
    label: { control: "text" },
    content: { control: "text" },
  },
  args: {
    label: "花子",
    content: "花子さん（編集者）",
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};
export const LongContent: Story = {
  args: {
    label: "花子",
    content:
      "花子さんは編集チームを取りまとめ、プロフィールの更新、アカウントの権限、公開スケジュールを確認しています。",
  },
};
