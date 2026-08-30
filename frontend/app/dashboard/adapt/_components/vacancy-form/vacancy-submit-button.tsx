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
      className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#2563a9] px-4 text-sm font-medium text-white transition-[background-color,box-shadow] hover:bg-[#2b6fba] hover:shadow-[0_10px_30px_rgba(24,88,155,0.2)] disabled:cursor-not-allowed disabled:opacity-50 md:mt-[30px]"
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
