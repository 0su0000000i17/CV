import Link from 'next/link';
import { Layers3, WandSparkles } from 'lucide-react';

import type { UploadedResume } from '@/src/shared/api/resumes';

type Props = {
  resume: UploadedResume;
};

export function ResumeAdaptationsCard({ resume }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-violet-500/10 p-2.5 text-violet-300 ring-1 ring-violet-500/20">
          <Layers3 className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Адаптации</h2>
          <p className="mt-1 text-sm text-muted-foreground">0 адаптаций</p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        Здесь будет список сохранённых адаптаций для этого резюме. Сейчас можно
        сразу перейти к созданию новой адаптации под вакансию.
      </p>

      <Link
        href={`/dashboard/adapt?resumeId=${resume.id}`}
        className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/15"
      >
        <WandSparkles className="h-4 w-4" />
        Создать адаптацию
      </Link>
    </div>
  );
}