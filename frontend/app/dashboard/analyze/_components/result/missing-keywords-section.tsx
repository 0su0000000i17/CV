import { Search } from 'lucide-react';

type Props = {
  keywords: string[];
};

export function MissingKeywordsSection({ keywords }: Props) {
  if (keywords.length <= 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.018] p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-white/55">
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
            className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-muted-foreground"
          >
            {keyword}
          </span>
        ))}
      </div>
    </section>
  );
}
