import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import {
  MyCheckbox,
  type MyCheckboxEventMap,
  type MyCheckboxProps,
} from "../web-components/checkbox";

type Args = MyCheckboxProps & {
  onCheckedChange: (event: MyCheckboxEventMap["checked-change"]) => void;
};

const meta = {
  title: "Components/Checkbox",
  component: MyCheckbox.tagName,
  tags: ["autodocs"],
  render: function Render(args) {
    const [, updateArgs] = useArgs<Args>();
    return html`
      <my-checkbox
        .label=${args.label}
        .checked=${args.checked}
        .disabled=${args.disabled}
        .error=${args.error}
        @checked-change=${(event: MyCheckboxEventMap["checked-change"]) => {
          args.onCheckedChange(event);
          updateArgs({ checked: event.detail.checked });
        }}
      ></my-checkbox>
    `;
  },
  argTypes: {
    label: { control: "text" },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "text" },
    onCheckedChange: { control: false },
  },
  args: {
    label: "利用規約に同意する",
    checked: false,
    disabled: false,
    error: "",
    onCheckedChange: fn(),
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};
export const Checked: Story = { args: { checked: true } };
export const ValidationError: Story = {
  name: "Error",
  args: { error: "利用規約への同意が必要です。" },
};
export const Disabled: Story = { args: { disabled: true } };
export const CheckedDisabled: Story = {
  args: { checked: true, disabled: true },
};
