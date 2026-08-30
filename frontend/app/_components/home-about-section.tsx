import {
  BrainCircuit,
  FileSearch2,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import type { PointerEventHandler } from 'react';

import { MARKETING_SECTIONS } from '@/src/shared/lib/marketing-navigation';
import styles from '../page.module.css';

type Props = {
  onSurfacePointerMove: PointerEventHandler<HTMLElement>;
};

type AboutPoint = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const points: AboutPoint[] = [
  {
    icon: FileSearch2,
    title: 'Резюме как рабочая система',
    description:
      'Загрузите PDF, оцените структуру и ATS-совместимость, усильте формулировки, навыки и достижения, а затем подготовьте отдельную версию под вакансию.',
  },
  {
    icon: BrainCircuit,
    title: 'Языковые модели и карьерная редакция',
    description:
      'Мы сохраняем подтверждённый опыт и показываем его точнее через сильные формулировки, релевантные hard skills, метрики и понятную структуру.',
  },
  {
    icon: ShieldCheck,
    title: 'Естественно для рекрутера и ATS',
    description:
      'Важные слова из вакансии встраиваются без искусственного текста, поэтому резюме остаётся понятным и человеку, и автоматическому отбору.',
  },
];

export function HomeAboutSection({ onSurfacePointerMove }: Props) {
  return (
    <section className="pt-24 md:pt-32">
      <div
        id={MARKETING_SECTIONS.about}
        className="scroll-mt-24 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-foreground/55">
            О проекте
          </p>
          <h2
            data-reveal
            className={styles.revealHeading + ' mt-5 text-4xl font-normal leading-[0.98] tracking-[-0.045em] text-foreground sm:text-5xl'}
          >
            Новое поколение инструментов
            <span className="block text-foreground">для карьерного роста</span>
          </h2>
        </div>

        <p className="max-w-xl text-base leading-7 text-muted-foreground lg:justify-self-end">
          Сервис помогает специалистам из разных сфер превратить факты опыта в
          цельное профессиональное резюме — от первого анализа до готового
          отклика.
        </p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {points.map((point) => {
          const Icon = point.icon;

          return (
            <article
              key={point.title}
              data-reveal
              onPointerMove={onSurfacePointerMove}
              className={
                styles.interactiveSurface +
                ' ' +
                styles.revealItem +
                ' relative min-h-72 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-6 sm:p-7'
              }
            >
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-white/75">
                <Icon className="h-5 w-5" strokeWidth={1.65} />
              </div>
              <h3 className="relative z-10 mt-12 text-xl font-medium tracking-tight text-foreground">
                {point.title}
              </h3>
              <p className="relative z-10 mt-3 text-sm leading-6 text-muted-foreground">
                {point.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
