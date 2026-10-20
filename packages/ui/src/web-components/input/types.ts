export interface MyInputProps {
  label?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export interface MyInputValueChangeDetail {
  value: string;
}

export interface MyInputEventMap {
  "value-change": CustomEvent<MyInputValueChangeDetail>;
}
