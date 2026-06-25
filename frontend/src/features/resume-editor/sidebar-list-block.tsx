import type { LucideIcon } from 'lucide-react';

type Props = {
  title: string;
  icon: LucideIcon;
  items: string[];
  tone?: 'default' | 'green' | 'orange';
};

export function SideBlock({ title, icon: Icon, items, tone = 'default' }: Props) {
  if (!items.length) {
    return null;
  }

  const iconClass =
    tone === 'green'
      ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20'
      : tone === 'orange'
        ? 'bg-orange-500/10 text-orange-300 ring-orange-500/20'
        : 'bg-muted text-foreground ring-border';

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className={'rounded-xl p-2 ring-1 ' + iconClass}>
          <Icon className="h-4 w-4" />
        </div>

        <h3 className="font-medium text-foreground">{title}</h3>
      </div>

      <div className="space-y-2.5">
        {items.map((item, index) => (
          <div key={item + index} className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />

            <p className="text-sm leading-relaxed text-muted-foreground">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
