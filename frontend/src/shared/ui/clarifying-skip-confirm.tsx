import { TriangleAlert } from 'lucide-react';

export function ClarifyingSkipConfirm(props: {
  warning: string; submitting: boolean;
  onSkip: () => void; onCancel: () => void;
}) {
  return (
    <div className="mt-6 flex animate-in items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4 fade-in slide-in-from-bottom-1 duration-300">
      <TriangleAlert className="h-4 w-4 shrink-0 text-white/45" />
      <div className="flex-1"><p className="text-sm leading-relaxed text-muted-foreground">{props.warning}</p>
        <div className="mt-3 flex gap-4">
          <button type="button" onClick={props.onSkip} disabled={props.submitting}
            className="cursor-pointer rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-white/25 hover:bg-white/[0.045] disabled:cursor-not-allowed">Всё равно пропустить</button>
          <button type="button" onClick={props.onCancel}
            className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">Вернуться к вопросам</button>
        </div>
      </div>
    </div>
  );
}
