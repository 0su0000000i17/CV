import { ArrowRight, Loader2 } from 'lucide-react';

type Props = {
  canContinue: boolean;
  hasAdaptation: boolean;
  isAdapting: boolean;
  onCreateAdaptation: () => void;
};

export function SidebarActionButton({
  canContinue,
  hasAdaptation,
  isAdapting,
  onCreateAdaptation,
}: Props) {
  if (!canContinue) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onCreateAdaptation}
      disabled={isAdapting}
      className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2563a9] px-4 py-3 text-sm font-medium text-white transition-[background-color,box-shadow] hover:bg-[#2b6fba] hover:shadow-[0_10px_30px_rgba(24,88,155,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isAdapting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Создаём...
        </>
      ) : hasAdaptation ? (
        <>
          Создать заново
          <ArrowRight className="h-4 w-4" />
        </>
      ) : (
        <>
          Создать адаптацию
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
