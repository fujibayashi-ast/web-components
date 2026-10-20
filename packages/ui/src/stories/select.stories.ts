import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import {
  MySelect,
  type MySelectEventMap,
  type MySelectProps,
} from "../web-components/select";

type Args = MySelectProps & {
  onValueChange: (event: MySelectEventMap["value-change"]) => void;
};

const meta = {
  title: "Components/Select",
  component: MySelect.tagName,
  tags: ["autodocs"],
  render: function Render(args) {
    const [, updateArgs] = useArgs<Args>();
    return html`
      <my-select
        .label=${args.label}
        .value=${args.value}
        .options=${args.options}
        .placeholder=${args.placeholder}
        .disabled=${args.disabled}
        .error=${args.error}
        @value-change=${(event: MySelectEventMap["value-change"]) => {
          args.onValueChange(event);
          updateArgs({ value: event.detail.value });
        }}
      ></my-select>
    `;
  },
  argTypes: {
    label: { control: "text" },
    value: { control: "text" },
    options: { control: "object" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    error: { control: "text" },
    onValueChange: { control: false },
  },
  args: {
    label: "アクセス権限",
    value: "",
    options: [
      { value: "reader", label: "閲覧者" },
      { value: "editor", label: "編集者" },
      { value: "admin", label: "管理者", disabled: true },
    ],
    placeholder: "アクセス権限を選択してください",
    disabled: false,
    error: "",
    onValueChange: fn(),
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};
export const Selected: Story = { args: { value: "editor" } };
export const ValidationError: Story = {
  name: "Error",
  args: { error: "アクセス権限を選択してください。" },
};
export const Disabled: Story = { args: { value: "reader", disabled: true } };
export const Empty: Story = { args: { options: [] } };
