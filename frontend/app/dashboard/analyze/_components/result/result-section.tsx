import type { LucideIcon } from 'lucide-react';

import { sectionIconClasses } from './section-icon-classes';

type Props = {
  title: string;
  items: string[];
  icon: LucideIcon;
  tone: keyof typeof sectionIconClasses;
};

export function ResultSection({ title, items, icon: Icon, tone }: Props) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${sectionIconClasses[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <h3 className="text-lg font-medium text-foreground">{title}</h3>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[11px] text-muted-foreground">
              {index + 1}
            </span>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {item}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
