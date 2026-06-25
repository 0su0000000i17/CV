type SmallInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type TextAreaProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
};

export function SmallInput({
  label,
  value,
  onChange,
  placeholder,
}: SmallInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 5,
  placeholder,
}: TextAreaProps) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      ) : null}

      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-border bg-background/70 px-4 py-3 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
      />
    </label>
  );
}