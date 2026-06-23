import type { ReactNode } from 'react';

type Props = {
  label: string;
  value: string;
  icon?: ReactNode;
};

export function MetaRow({ label, value, icon }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border/70 py-2 first:border-t-0 first:pt-0 last:pb-0">
      <p className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>

      <div className="flex min-w-0 max-w-[65%] items-center justify-end gap-2 text-right text-sm font-medium text-foreground">
        {icon}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}
