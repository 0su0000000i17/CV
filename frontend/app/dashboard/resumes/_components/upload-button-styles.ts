export type UploadButtonVariant = 'primary' | 'secondary';

export function joinClassNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function getUploadButtonClass(variant: UploadButtonVariant) {
  return variant === 'secondary'
    ? 'border border-border text-foreground hover:bg-muted'
    : 'bg-brand-500 text-white hover:bg-brand-600';
}
