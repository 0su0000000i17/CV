import { AlertCircle } from 'lucide-react';

type Props = {
  errorMessage?: string;
};

export function AnalysisErrorState({ errorMessage }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300 ring-1 ring-red-500/20">
          <AlertCircle className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">
            Не удалось выполнить оценку
          </h2>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {errorMessage ||
              'Попробуйте запустить анализ ещё раз. Если ошибка повторится, проверим backend-логи.'}
          </p>
        </div>
      </div>
    </div>
  );
}
