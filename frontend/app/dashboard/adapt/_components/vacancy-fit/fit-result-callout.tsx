import { AlertTriangle, CheckCircle2 } from 'lucide-react';

type Props = {
  canAdapt: boolean;
};

export function FitResultCallout({ canAdapt }: Props) {
  if (canAdapt) {
    return (
      <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />

        <p className="text-sm leading-relaxed text-muted-foreground">
          Проверка пройдена. Теперь можно создать адаптированный черновик резюме.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />

      <p className="text-sm leading-relaxed text-muted-foreground">
        Сервис не будет создавать адаптацию, если для неё нужно придумать опыт,
        которого нет в резюме.
      </p>
    </div>
  );
}
