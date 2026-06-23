import { Play, RotateCw, Sparkles } from 'lucide-react';

import type { UploadedResume } from '@/src/shared/api/resumes';

type Props = {
  selectedResume?: UploadedResume;
  isAnalyzing: boolean;
  onAnalyze: () => void;
};

function isResumeAnalyzed(resume?: UploadedResume) {
  return Boolean(
    resume &&
      resume.analysis_status === 'completed' &&
      resume.last_score !== null
  );
}

export function AnalyzeHeader({
  selectedResume,
  isAnalyzing,
  onAnalyze,
}: Props) {
  const analyzed = isResumeAnalyzed(selectedResume);

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
            {analyzed
              ? 'Резюме уже оценено. Можно посмотреть результат или запустить повторную проверку, если вы обновили файл или хотите пересчитать оценку.'
              : 'Проверьте резюме по структуре, опыту, навыкам и пригодности для отклика. После анализа сервис покажет, что стоит усилить.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={!selectedResume || isAnalyzing}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse" />
              Оценка идёт...
            </>
          ) : analyzed ? (
            <>
              <RotateCw className="h-4 w-4" />
              Повторить оценку
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Запустить оценку
            </>
          )}
        </button>
      </div>
    </div>
  );
}