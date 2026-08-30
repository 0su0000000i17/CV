import { ArrowRight, Upload } from 'lucide-react';
import Link from 'next/link';

import { UploadResumeButton } from '../resumes/_components/upload-resume-button';
import styles from '../dashboard.module.css';
import type { UploadedResume } from '@/src/shared/api/resumes';

export function DashboardHero(props: {
  firstName: string;
  resumesCount: number;
  latestResume?: UploadedResume;
  onUploaded: (resume: UploadedResume) => void;
}) {
  return (
    <section className={`${styles.heroSurface} overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02]`}>
      <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)]">
        <div className="p-6 sm:p-8 xl:p-10">
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-white/35">Личный кабинет · Обзор</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-medium tracking-[-0.045em] text-foreground sm:text-5xl">Добрый день, {props.firstName}</h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Все резюме и следующие действия собраны здесь — без лишних шагов между оценкой, улучшением и адаптацией.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <UploadResumeButton
              icon={<Upload className="h-4 w-4" />}
              className="w-full bg-brand-500 text-white hover:bg-brand-600 sm:w-auto"
              errorAlign="left"
              currentResumeCount={props.resumesCount}
              onUploaded={props.onUploaded}
            >
              Загрузить резюме
            </UploadResumeButton>
            <Link href="/dashboard/resumes" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-foreground transition-[background-color,border-color,transform] hover:border-white/20 hover:bg-white/[0.04] active:scale-[0.98]">
              Мои резюме <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <aside className="border-t border-white/10 bg-black/15 p-6 sm:p-8 lg:border-l lg:border-t-0">
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/35">Последняя оценка</p>
          <div className="mt-5 flex items-end gap-2">
            <span className="text-5xl font-medium tracking-[-0.06em] text-white">{props.latestResume?.last_score ?? '—'}</span>
            <span className="pb-1 text-sm text-white/30">/100</span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{props.latestResume?.title || 'Оценок пока нет'}</p>
        </aside>
      </div>
    </section>
  );
}
