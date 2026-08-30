type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
};

export function TextArea({ label, value, onChange, rows = 5, placeholder }: Props) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm text-muted-foreground">{label}</span> : null}
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
      />
    </label>
  );
}
