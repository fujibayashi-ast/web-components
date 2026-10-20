import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import {
  MyInput,
  type MyInputEventMap,
  type MyInputProps,
} from "../web-components/input";

type Args = MyInputProps & {
  onValueChange: (event: MyInputEventMap["value-change"]) => void;
};

const meta = {
  title: "Components/Input",
  component: MyInput.tagName,
  tags: ["autodocs"],
  render: function Render(args) {
    const [, updateArgs] = useArgs<Args>();
    return html`
      <my-input
        .label=${args.label}
        .value=${args.value}
        .placeholder=${args.placeholder}
        .disabled=${args.disabled}
        .error=${args.error}
        @value-change=${(event: MyInputEventMap["value-change"]) => {
          args.onValueChange(event);
          updateArgs({ value: event.detail.value });
        }}
      ></my-input>
    `;
  },
  argTypes: {
    label: { control: "text" },
    value: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    error: { control: "text" },
    onValueChange: { control: false },
  },
  args: {
    label: "アカウント名",
    value: "",
    placeholder: "名前を入力してください",
    disabled: false,
    error: "",
    onValueChange: fn(),
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};
export const Filled: Story = { args: { value: "花子" } };
export const ValidationError: Story = {
  name: "Error",
  args: { error: "アカウント名を入力してください。" },
};
export const Disabled: Story = { args: { value: "花子", disabled: true } };
