import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export function ClarifyingNavigation(props: {
  first: boolean; last: boolean; answered: boolean; submitting: boolean;
  submitLabel: string; onBack: () => void; onNext: () => void;
}) {
  return (
    <div className="mt-7 flex items-center justify-between gap-3">
      <button type="button" onClick={props.onBack} disabled={props.first || props.submitting}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-muted-foreground transition-[background-color,border-color,color,transform] hover:border-white/20 hover:bg-white/[0.035] hover:text-foreground active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">
        <ArrowLeft className="h-4 w-4" />Назад
      </button>
      <button type="button" onClick={props.onNext} disabled={!props.answered || props.submitting}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#2563a9] px-5 py-2.5 text-sm font-medium text-white transition-[background-color,transform,box-shadow] hover:bg-[#2b6fba] hover:shadow-[0_10px_32px_rgba(24,88,155,0.2)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
        {props.submitting ? <Loader2 className="h-4 w-4 animate-spin" />
          : props.last ? <Sparkles className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        {props.last ? props.submitLabel : 'Далее'}
      </button>
    </div>
  );
}
