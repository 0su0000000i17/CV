import { Loader2, SearchCheck } from 'lucide-react';

type Props = {
  vacancyInput: string;
  isPreparing: boolean;
  isCheckingFit: boolean;
  onPrepareVacancy: () => void;
};

export function VacancySubmitButton({
  vacancyInput,
  isPreparing,
  isCheckingFit,
  onPrepareVacancy,
}: Props) {
  const isBusy = isPreparing || isCheckingFit;

  return (
    <button
      type="button"
      onClick={onPrepareVacancy}
      disabled={isBusy || !vacancyInput.trim()}
      className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60 md:mt-[30px]"
    >
      {isPreparing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Разбираем...
        </>
      ) : isCheckingFit ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Проверяем...
        </>
      ) : (
        <>
          <SearchCheck className="h-4 w-4" />
          Проверить совместимость
        </>
      )}
    </button>
  );
}
