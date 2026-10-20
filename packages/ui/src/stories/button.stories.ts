import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { fn } from "storybook/test";
import {
  MyButton,
  type MyButtonEventMap,
  type MyButtonProps,
} from "../web-components/button";

type Args = MyButtonProps & {
  onCountChange: (event: MyButtonEventMap["count-change"]) => void;
};

const meta = {
  title: "Components/Button",
  component: MyButton.tagName,
  tags: ["autodocs"],
  render: (args) => html`
    <my-button
      .name=${args.name}
      .label=${args.label}
      .count=${args.count}
      .loading=${args.loading}
      .disabled=${args.disabled}
      .buttonClass=${args.buttonClass}
      @count-change=${args.onCountChange}
    ></my-button>
  `,
  argTypes: {
    name: { control: "text" },
    label: { control: "text" },
    count: { control: { type: "number", min: 0 } },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    buttonClass: { control: "text" },
    onCountChange: { control: false },
  },
  args: {
    name: "世界",
    label: "",
    count: 0,
    loading: false,
    disabled: false,
    buttonClass: "",
    onCountChange: fn(),
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};

export const Label: Story = {
  args: { label: "変更を保存", buttonClass: "w-48" },
};

export const Loading: Story = {
  args: { label: "変更を保存", buttonClass: "w-48", loading: true },
};

export const Disabled: Story = {
  args: { label: "変更を保存", disabled: true },
};

export const CustomClass: Story = {
  args: {
    label: "変更を保存",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700",
  },
};
