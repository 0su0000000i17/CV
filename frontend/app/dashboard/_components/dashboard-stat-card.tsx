import type { ReactNode } from 'react';

export function DashboardStatCard({
  label,
  value,
  caption,
  icon,
}: {
  label: string;
  value: string;
  caption: string;
  icon: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.018] p-5 transition-[background-color,border-color] hover:border-white/15 hover:bg-white/[0.028]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/35">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-white/55">{icon}</span>
      </div>
      <p className="mt-6 text-3xl font-medium tracking-[-0.04em] text-white">{value}</p>
      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{caption}</p>
    </article>
  );
}
