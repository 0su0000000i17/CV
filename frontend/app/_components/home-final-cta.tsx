import type { PointerEventHandler } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import styles from '../page.module.css';

export function HomeFinalCta({
  onPointerMove,
}: {
  onPointerMove: PointerEventHandler<HTMLElement>;
}) {
  return (
    <section
      data-reveal
      onPointerMove={onPointerMove}
      className={`${styles.interactiveSurface} ${styles.revealItem} mt-28 flex flex-col items-start gap-6 rounded-[2rem] border border-border bg-card/50 p-7 sm:p-9 md:mt-36 md:flex-row md:items-center md:justify-between`}
    >
      <div className="relative z-10">
        <h2 className={`${styles.revealHeading} text-2xl font-normal tracking-tight text-foreground sm:text-3xl`}>
          Готовы усилить резюме?
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Бесплатная оценка резюме — без карты и обязательств.
        </p>
      </div>
      <Link
        href="/login"
        className="group relative z-10 inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600 active:scale-[0.98] md:w-auto"
      >
        Загрузить резюме бесплатно
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}
