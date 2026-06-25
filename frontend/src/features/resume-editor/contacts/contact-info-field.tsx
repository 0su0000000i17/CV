type Props = {
  label: string;
  value: string;
};

export function ContactInfoField({ label, value }: Props) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 truncate text-sm text-foreground">
        {value || 'Не указано'}
      </p>
    </div>
  );
}
