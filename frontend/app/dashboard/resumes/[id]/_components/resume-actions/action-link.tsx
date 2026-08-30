import Link from 'next/link';

import type { createActionItems } from './action-items';
import { getToneClassName } from './action-tone';

type Props = {
  action: ReturnType<typeof createActionItems>[number];
};

export function ActionLink({ action }: Props) {
  const Icon = action.icon;
  const tone = getToneClassName(action.tone);

  return (
    <Link
      href={action.href}
      className={`flex cursor-pointer items-start gap-4 rounded-2xl border border-border bg-background p-4 transition-colors ${tone.card}`}
    >
      <div className={`rounded-xl p-3 ring-1 ${tone.icon}`}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-foreground">{action.title}</p>

          {action.badge ? (
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              {action.badge}
            </span>
          ) : null}
        </div>

        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {action.description}
        </p>
      </div>
    </Link>
  );
}
