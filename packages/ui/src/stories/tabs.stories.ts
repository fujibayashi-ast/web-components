import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";
import {
  MyTabs,
  type MyTabsEventMap,
  type MyTabsProps,
} from "../web-components/tabs";

type Args = MyTabsProps & {
  onValueChange: (event: MyTabsEventMap["value-change"]) => void;
};

const meta = {
  title: "Components/Tabs",
  component: MyTabs.tagName,
  tags: ["autodocs"],
  render: function Render(args) {
    const [, updateArgs] = useArgs<Args>();
    return html`
      <my-tabs
        .label=${args.label}
        .value=${args.value}
        .items=${args.items}
        @value-change=${(event: MyTabsEventMap["value-change"]) => {
          args.onValueChange(event);
          updateArgs({ value: event.detail.value });
        }}
      >
        ${args.items?.map(
          (item) => html`
            <div slot=${item.value}>
              <h3 class="mb-2 font-semibold">${item.label}</h3>
              <p>花子</p>
            </div>
          `,
        )}
      </my-tabs>
    `;
  },
  argTypes: {
    label: { control: "text" },
    value: { control: "text" },
    items: { control: "object" },
    onValueChange: { control: false },
  },
  args: {
    label: "アカウントの項目",
    value: "profile",
    items: [
      { value: "profile", label: "プロフィール" },
      { value: "activity", label: "アクティビティ" },
      { value: "billing", label: "請求" },
    ],
    onValueChange: fn(),
  },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {};
export const SecondTab: Story = { args: { value: "activity" } };
export const DisabledTab: Story = {
  args: {
    items: [
      { value: "profile", label: "プロフィール" },
      { value: "activity", label: "アクティビティ", disabled: true },
      { value: "billing", label: "請求" },
    ],
  },
};
