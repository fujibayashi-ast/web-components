export interface MyImageUploaderProps {
  label?: string;
  files?: readonly File[];
  allowedTypes?: readonly string[];
  maxFiles?: number;
  maxBytes?: number;
  disabled?: boolean;
  error?: string;
}

export interface MyImageUploaderFilesChangeDetail {
  files: File[];
}

export interface MyImageUploaderFilesRejectDetail {
  message: string;
}

export interface MyImageUploaderEventMap {
  "files-change": CustomEvent<MyImageUploaderFilesChangeDetail>;
  "files-reject": CustomEvent<MyImageUploaderFilesRejectDetail>;
}
