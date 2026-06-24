import { Mail } from 'lucide-react';

export function CoverLetterHeader() {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-foreground p-3 text-background">
          <Mail className="h-6 w-6" />
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Cover Letter
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Сопроводительное письмо
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Сгенерируйте письмо под конкретную вакансию на основе вашего резюме.
            Без лишней воды, без выдуманного опыта и с нужным тоном.
          </p>
        </div>
      </div>
    </div>
  );
}