import { Play } from 'lucide-react';

import type { UploadedResume } from '@/src/shared/api/resumes';

type Props = {
  selectedResume?: UploadedResume;
};

export function AnalyzeHeader({ selectedResume }: Props) {
  return (
    <div className="mb-10">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Личный кабинет / Оценка резюме
      </p>

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-normal tracking-tight text-foreground md:text-5xl">
            Оценка резюме
          </h1>

          <p className="mt-4 max-w-2xl text-muted-foreground">
            Проверьте резюме по структуре, опыту, навыкам и пригодности для
            отклика. После анализа сервис покажет, что стоит усилить.
          </p>
        </div>

        <button
          type="button"
          disabled={!selectedResume}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          Запустить оценку
        </button>
      </div>
    </div>
  );
}
