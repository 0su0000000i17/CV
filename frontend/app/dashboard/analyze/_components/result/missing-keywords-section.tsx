import { Search } from 'lucide-react';

type Props = {
  keywords: string[];
};

export function MissingKeywordsSection({ keywords }: Props) {
  if (keywords.length <= 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">
          <Search className="h-4 w-4" />
        </div>

        <h3 className="text-lg font-medium text-foreground">
          Недостающие ключевые слова
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <span
            key={keyword}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
          >
            {keyword}
          </span>
        ))}
      </div>
    </section>
  );
}
