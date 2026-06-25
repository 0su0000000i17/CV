import { FileSearch, Loader2 } from 'lucide-react';

export function EditorLoadingState() {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <FileSearch className="h-4 w-4 text-muted-foreground" />

            <h2 className="text-base font-medium text-foreground">
              Подготавливаем редактор резюме
            </h2>
          </div>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Разбираем резюме, достаём опыт, навыки и образование.
          </p>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-400/70" />
          </div>
        </div>
      </div>
    </div>
  );
}