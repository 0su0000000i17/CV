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

function needsReanalysis(resume?: UploadedResume) {
  return Boolean(resume && resume.analysis_status === 'needs_update');
}

export function AnalyzeHeader({
  selectedResume,
  isAnalyzing,
  onAnalyze,
}: Props) {
  const analyzed = isResumeAnalyzed(selectedResume);
  const staleAnalysis = needsReanalysis(selectedResume);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02]">
      <div className="flex flex-col gap-7 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between xl:p-10">
        <div className="max-w-2xl">
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-white/35">
            Личный кабинет · Оценка резюме
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] text-foreground sm:text-5xl">
            Оценка резюме
          </h1>

          <p className="mt-5 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            {isAnalyzing
              ? 'Идёт профессиональная проверка резюме. Результат, итоговая оценка и детализация появятся одновременно после завершения анализа.'
              : staleAnalysis
                ? 'Резюме изменилось после последней оценки — старый результат мог устареть. Пересчитайте оценку, чтобы увидеть актуальный результат.'
                : analyzed
                  ? 'Резюме уже оценено. Можно посмотреть результат или запустить повторную проверку, если вы обновили файл или хотите пересчитать оценку.'
                  : 'Проверьте резюме по структуре, опыту, навыкам и пригодности для отклика. После анализа сервис покажет, что стоит усилить.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={!selectedResume || isAnalyzing}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-[background-color,transform,opacity] hover:bg-brand-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="h-4 w-4 animate-pulse" />
              Оценка идёт...
            </>
          ) : staleAnalysis ? (
            <>
              <RotateCw className="h-4 w-4" />
              Пересчитать оценку
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
    </section>
  );
}
