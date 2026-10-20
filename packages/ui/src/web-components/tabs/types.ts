export interface MyTab {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MyTabsProps {
  label?: string;
  value?: string;
  items?: readonly MyTab[];
}

export interface MyTabsValueChangeDetail {
  value: string;
}

export interface MyTabsEventMap {
  "value-change": CustomEvent<MyTabsValueChangeDetail>;
}
