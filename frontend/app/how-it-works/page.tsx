import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

import styles from '../_components/marketing-info.module.css';
import { HowBenefits } from './how-benefits';
import { HowResultExample } from './how-result-example';
import { HowStepsGrid } from './how-steps-grid';

export default function HowItWorksPage() {
  return (
    <div className={`${styles.page} mx-auto w-full max-w-[1028px]`}>
      <section className="mx-auto flex max-w-3xl flex-col items-center pt-4 text-center sm:pt-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/35 bg-brand-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-brand-300">
          <Sparkles className="h-3.5 w-3.5" />Как это работает
        </div>
        <h1 className="mt-6 text-[clamp(2.5rem,5vw,3.75rem)] font-normal leading-[0.96] tracking-[-0.05em] text-foreground">
          От исходного резюме<span className="block text-brand-500">до сильного отклика</span>
        </h1>
        <p className="mt-6 max-w-[43rem] text-base leading-7 text-muted-foreground">
          Один понятный процесс: оценка, консультационные вопросы, профессиональная редакция и готовая версия — без выдуманных фактов и шаблонных фраз.
        </p>
        <Link href="/dashboard/analyze" className="group mt-8 inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600">
          Проверить резюме
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </section>
      <HowStepsGrid />
      <HowResultExample />
      <HowBenefits />
    </div>
  );
}
