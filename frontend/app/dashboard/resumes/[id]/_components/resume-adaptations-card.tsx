import Link from 'next/link';
import { Layers3 } from 'lucide-react';

import type { UploadedResume } from '@/src/shared/api/resumes';

type Props = {
  resume: UploadedResume;
};

export function ResumeAdaptationsCard({ resume }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-muted p-2.5">
          <Layers3 className="h-5 w-5 text-foreground" />
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
        className="mt-5 inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Создать адаптацию
      </Link>
    </div>
  );
}