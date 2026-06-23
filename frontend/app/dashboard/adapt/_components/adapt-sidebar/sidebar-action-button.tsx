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
      className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-50"
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
