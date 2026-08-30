type Props = {
  label: string;
  value: string;
};

export function ContactInfoField({ label, value }: Props) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-background/60 px-3 py-2">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-0.5 truncate text-sm text-foreground">
        {value || 'Не указано'}
      </p>
    </div>
  );
}
