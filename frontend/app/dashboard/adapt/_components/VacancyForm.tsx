import { Briefcase, LinkIcon } from 'lucide-react';

export function VacancyForm() {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-6 flex items-start gap-4">
        <div className="rounded-xl bg-muted p-3">
          <Briefcase className="h-5 w-5 text-foreground" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Вакансия</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Вставьте текст вакансии или ссылку. Позже мы добавим автоматический
            парсинг HH.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div>
          <label className="mb-2 block text-sm text-muted-foreground">
            Ссылка на вакансию
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
            <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder="https://hh.ru/vacancy/..."
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="hidden items-end pb-3 text-xs uppercase tracking-widest text-muted-foreground md:flex">
          или
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm text-muted-foreground">
          Текст вакансии
        </label>

        <textarea
          placeholder="Вставьте описание вакансии, требования, обязанности и условия..."
          className="min-h-[220px] w-full resize-none rounded-2xl border border-border bg-background px-4 py-4 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
