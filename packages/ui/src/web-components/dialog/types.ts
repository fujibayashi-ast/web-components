export interface MyDialogProps {
  label?: string;
  open?: boolean;
}

export interface MyDialogOpenChangeDetail {
  open: boolean;
}

export interface MyDialogEventMap {
  "open-change": CustomEvent<MyDialogOpenChangeDetail>;
}
