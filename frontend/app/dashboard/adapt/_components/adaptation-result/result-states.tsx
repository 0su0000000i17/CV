import { AlertCircle, Loader2 } from 'lucide-react';

export function LoadingState() {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-muted p-3">
          <Loader2 className="h-5 w-5 animate-spin text-foreground" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">
            Создаём адаптацию
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Перепаковываем подтверждённый опыт под вакансию, усиливаем
            релевантные навыки и готовим черновик для проверки.
          </p>
        </div>
      </div>
    </section>
  );
}

export function ErrorState({ errorMessage }: { errorMessage?: string }) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-red-500/10 p-3 text-red-300 ring-1 ring-red-500/20">
          <AlertCircle className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">
            Не удалось создать адаптацию
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {errorMessage ||
              'Попробуйте ещё раз. Если ошибка повторится, проверим backend-логи.'}
          </p>
        </div>
      </div>
    </section>
  );
}
