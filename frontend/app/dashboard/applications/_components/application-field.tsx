export const applicationInputClassName =
  'mt-2 h-11 w-full rounded-lg border border-foreground/10 bg-foreground/[0.025] px-3 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/25 focus:border-foreground/25';

export const applicationAutocompleteClassName =
  'mt-2 flex h-11 items-center rounded-lg border border-foreground/10 bg-foreground/[0.025] px-3 pr-10 transition-colors focus-within:border-foreground/25';

export function ApplicationField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-foreground/45">
        {label}
      </span>
      {children}
    </label>
  );
}
