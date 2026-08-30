'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-border bg-card/60 p-6 text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Ошибка
        </p>
        <h2 className="text-xl font-medium text-foreground">
          Не удалось загрузить раздел
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Попробуйте ещё раз. Если ошибка повторится, вернитесь в личный
          кабинет и зайдите в раздел заново.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
