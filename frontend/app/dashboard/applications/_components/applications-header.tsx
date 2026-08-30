import { BriefcaseBusiness, Info, Plus, X } from 'lucide-react';

import styles from '../applications.module.css';

export function ApplicationsHeader({
  formOpen,
  onToggleForm,
}: {
  formOpen: boolean;
  onToggleForm: () => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-foreground/10 bg-foreground/[0.02]">
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="flex max-w-3xl items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-foreground/10 bg-foreground/[0.035] text-foreground/70">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.17em] text-foreground/40">
              Поиск работы и интервью
            </p>
            <h1 className="mt-3 text-3xl font-medium tracking-[-0.045em] text-foreground sm:text-4xl">
              Мои отклики
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/55 sm:text-base">
              Ведите вакансии от первого отклика до оффера и планируйте интервью — дата,
              время и договорённости останутся в одном месте.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleForm}
          aria-expanded={formOpen}
          className="inline-flex h-11 min-w-[11.5rem] cursor-pointer items-center justify-center rounded-lg bg-[#2563a9] px-4 text-sm font-medium text-white transition-[background-color,transform] hover:bg-[#2b6fba] active:scale-[0.98]"
        >
          <span key={formOpen ? 'close' : 'open'} className={styles.buttonSwap}>
            {formOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {formOpen ? 'Закрыть' : 'Добавить запись'}
          </span>
        </button>
      </div>
      <div className="flex items-start gap-3 border-t border-foreground/10 bg-brand-500/[0.07] px-6 py-4 sm:px-8">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
        <p className="text-sm leading-6 text-foreground/60">
          Это также планировщик собеседований. Выберите статус «Интервью», укажите
          дату и время — встреча появится в блоке ближайших интервью.
        </p>
      </div>
    </section>
  );
}
