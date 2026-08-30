'use client';

import type { PointerEventHandler } from 'react';
import Link from 'next/link';
import { Manrope } from 'next/font/google';
import { ArrowRight } from 'lucide-react';

import { HomeHeroDemo } from './home-hero-demo';
import styles from '../page.module.css';

const manrope = Manrope({ subsets: ['latin', 'cyrillic'], weight: ['700'] });

export function HomeHeroSection({
  onPointerMove,
}: {
  onPointerMove: PointerEventHandler<HTMLElement>;
}) {
  return (
    <section className="relative flex flex-col items-center justify-start pb-12 pt-12 text-center sm:pb-14 sm:pt-16 lg:pb-16">
      <Link
        href="/login"
        data-reveal
        className={`${styles.noticeButton} ${styles.revealItem} group inline-flex min-h-9 max-w-full items-center gap-2 rounded-full px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-white`}
      >
        <span className="relative z-10 rounded-full bg-brand-500 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white sm:text-xs">
          Free
        </span>
        <span className="relative z-10 truncate">Загрузить резюме бесплатно</span>
        <span className={styles.ctaArrowViewport}>
          <ArrowRight className={`${styles.ctaArrow} h-4 w-4 shrink-0`} />
        </span>
      </Link>
      <h1
        data-reveal
        className={`${styles.heroTitle} mt-6 max-w-4xl text-[clamp(2.5rem,5.35vw,3.75rem)] font-normal leading-[0.94] tracking-[-0.05em] text-foreground`}
      >
        <span className={styles.heroLine}>
          <span
            className={`${manrope.className} ${styles.aiServiceHighlight} bg-clip-text font-bold text-transparent`}
          >
            ИИ-сервис,
          </span>
        </span>
        <span className={styles.heroLine}>который ведёт к офферу</span>
      </h1>
      <p
        data-reveal
        className={`${styles.revealItem} mt-5 max-w-[43rem] text-sm leading-6 text-muted-foreground sm:text-base`}
      >
        Оценивай резюме, усиливай формулировки, адаптируй под вакансии и создавай
        сильные сопроводительные письма
      </p>
      <HomeHeroDemo onPointerMove={onPointerMove} />
    </section>
  );
}
