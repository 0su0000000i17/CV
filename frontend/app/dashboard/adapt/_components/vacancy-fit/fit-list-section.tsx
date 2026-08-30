type Props = {
  title: string;
  items: string[];
  tone: 'positive' | 'gap' | 'critical';
};

export function FitListSection({ title, items, tone }: Props) {
  if (!items.length) {
    return null;
  }

  const titleClass = {
    positive: 'text-brand-300',
    gap: 'text-foreground/70',
    critical: 'text-red-300',
  }[tone];

  return (
    <div className="border-t border-border py-4 first:border-t-0 first:pt-0 last:pb-0">
      <h3 className={'text-sm font-medium ' + titleClass}>{title}</h3>

      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />

            <p className="text-sm leading-relaxed text-muted-foreground">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
