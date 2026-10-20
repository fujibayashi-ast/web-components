export interface MyCheckboxProps {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  error?: string;
}

export interface MyCheckboxCheckedChangeDetail {
  checked: boolean;
}

export interface MyCheckboxEventMap {
  "checked-change": CustomEvent<MyCheckboxCheckedChangeDetail>;
}
