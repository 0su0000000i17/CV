import { Wand2 } from "lucide-react";

export function AdaptHeader() {
  return (
    <div className="mb-10">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Личный кабинет / Адаптация
      </p>

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-normal tracking-tight text-foreground md:text-5xl">
            Адаптация под вакансию
          </h1>

          <p className="mt-4 max-w-2xl text-muted-foreground">
            Выберите резюме, вставьте вакансию и получите версию, которая точнее
            попадает в требования работодателя.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80">
          <Wand2 className="h-4 w-4" />
          Адаптировать
        </button>
      </div>
    </div>
  );
}