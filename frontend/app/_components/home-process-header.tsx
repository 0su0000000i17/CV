import { ListChecks } from 'lucide-react';

import { MARKETING_SECTIONS } from '@/src/shared/lib/marketing-navigation';
import styles from '../page.module.css';

export function HomeProcessHeader() {
  return (
    <div id={MARKETING_SECTIONS.process} className="scroll-mt-24 max-w-3xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-foreground/65">
        <ListChecks className="h-3.5 w-3.5" />
        Как это работает
      </div>
      <h2 data-reveal className={`${styles.revealHeading} mt-6 text-4xl font-normal leading-[0.98] tracking-[-0.045em] text-foreground sm:text-5xl`}>
        От резюме до готового отклика
        <span className="block text-foreground">в одном кабинете</span>
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
        Сервис честно оценивает резюме, уточняет детали как карьерный консультант
        и готовит усиленную версию для рассылки или отдельный вариант под
        вакансию — без выдуманного опыта и цифр.
      </p>
    </div>
  );
}
