type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel';
  inputMode?: 'text' | 'email' | 'tel' | 'numeric';
  autoComplete?: string;
  error?: string;
  onBlur?: () => void;
};

export function SmallInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
  autoComplete,
  error,
  onBlur,
}: Props) {
  return (
    <label className="block">
      <span className="relative block">
        <span className="pointer-events-none absolute left-3 top-1 text-[11px] leading-none text-muted-foreground">
          {label}
        </span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className={`h-10 w-full rounded-lg border bg-background/70 px-3 pb-1.5 pt-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground ${
            error ? 'border-red-500/70 focus:border-red-400' : 'border-border focus:border-foreground/40'
          }`}
        />
      </span>
      {error ? <span className="mt-1 block text-xs text-red-400">{error}</span> : null}
    </label>
  );
}
