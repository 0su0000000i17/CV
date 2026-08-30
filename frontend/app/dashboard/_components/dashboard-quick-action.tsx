import type { ReactNode } from 'react';
import Link from 'next/link';

export function DashboardQuickAction(props: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={props.href}
      className="group flex gap-3 rounded-xl border border-transparent p-3 transition-[background-color,border-color,transform] hover:border-white/10 hover:bg-white/[0.035] active:scale-[0.99]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-white/60 transition-colors group-hover:text-white">
        {props.icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{props.title}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{props.description}</span>
      </span>
    </Link>
  );
}
