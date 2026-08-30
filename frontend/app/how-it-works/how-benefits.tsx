import { CheckCircle2 } from 'lucide-react';

import { howResults } from './how-content';

export function HowBenefits() {
  return (
    <section className="mt-4 rounded-[2rem] border border-white/10 bg-black/20 p-7 sm:p-9">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-brand-400">Что вы получите</p>
          <h2 className="mt-4 text-3xl font-normal leading-tight tracking-[-0.04em] text-foreground">
            Готовый документ, который удобно использовать
          </h2>
        </div>
        <div className="grid gap-3">
          {howResults.map((result) => (
            <div key={result} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
              <p className="text-sm leading-6 text-foreground/85">{result}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
