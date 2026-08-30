import Link from 'next/link';
import { Layers3, WandSparkles } from 'lucide-react';

import type { UploadedResume } from '@/src/shared/api/resumes';
import { useResumeAdaptationsSummaryQuery } from '@/src/shared/hooks/use-resume-adaptations-summary-query';

type Props = {
  resume: UploadedResume;
  accessToken: string;
};

function formatAdaptationsCount(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return `${count} адаптация`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} адаптации`;
  }

  return `${count} адаптаций`;
}

export function ResumeAdaptationsCard({ resume, accessToken }: Props) {
  const summaryQuery = useResumeAdaptationsSummaryQuery(resume.id, accessToken);
  const count = summaryQuery.data?.count ?? 0;
  const counterText = summaryQuery.isPending ? 'Загружаем...' : formatAdaptationsCount(count);

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-brand-500/10 p-2.5 text-brand-300 ring-1 ring-brand-500/20">
          <Layers3 className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Адаптации</h2>
          <p className="mt-1 text-sm text-muted-foreground">{counterText}</p>
        </div>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        Создайте отдельную версию резюме под конкретную вакансию и сохраните её в PDF.
      </p>

      <Link
        href={`/dashboard/adapt?resumeId=${resume.id}`}
        className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 px-4 py-3 text-sm font-medium text-brand-300 transition-colors hover:bg-brand-500/15"
      >
        <WandSparkles className="h-4 w-4" />
        Создать адаптацию
      </Link>
    </div>
  );
}
