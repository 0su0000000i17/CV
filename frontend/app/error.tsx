'use client';

import { useEffect } from 'react';

export default function Error({
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
    <div className="mx-auto flex max-w-xl flex-col items-start py-12">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Ошибка
      </p>
      <h1 className="text-4xl font-normal tracking-tight text-foreground md:text-5xl">
        Что-то пошло не так
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Страница не смогла загрузиться. Попробуйте ещё раз — если ошибка
        повторится, напишите нам на{' '}
        <a href="mailto:support@cvmatch.ru" className="text-foreground underline underline-offset-4">
          support@cvmatch.ru
        </a>
        .
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center justify-center rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
      >
        Попробовать снова
      </button>
    </div>
  );
}
