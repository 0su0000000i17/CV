import { Briefcase } from 'lucide-react';

import type { PageExtractionStatus } from '@/src/shared/api/vacancies';

type Props = {
  vacancyInput: string;
  extractionStatus: PageExtractionStatus | null;
  extractionMessage: string;
  onVacancyInputChange: (value: string) => void;
};

export function CoverLetterVacancyCard({
  vacancyInput,
  extractionStatus,
  extractionMessage,
  onVacancyInputChange,
}: Props) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20">
          <Briefcase className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Вакансия</h2>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Вставьте ссылку или полный текст вакансии. Мы распознаем описание и
            используем его для письма.
          </p>
        </div>
      </div>

      <textarea
        value={vacancyInput}
        onChange={(event) => onVacancyInputChange(event.target.value)}
        placeholder="Ссылка на вакансию или полный текст описания..."
        className="min-h-[180px] w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
      />

      {extractionMessage ? (
        <p
          className={`mt-3 text-sm ${
            extractionStatus === 'success'
              ? 'text-emerald-500'
              : 'text-orange-500'
          }`}
        >
          {extractionMessage}
        </p>
      ) : null}
    </section>
  );
}
