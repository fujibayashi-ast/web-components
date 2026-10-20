export interface MySelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MySelectProps {
  label?: string;
  value?: string;
  options?: readonly MySelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export interface MySelectValueChangeDetail {
  value: string;
}

export interface MySelectEventMap {
  "value-change": CustomEvent<MySelectValueChangeDetail>;
}
