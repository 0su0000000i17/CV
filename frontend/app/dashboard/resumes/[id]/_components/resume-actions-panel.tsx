import Link from 'next/link';
import { BarChart3, WandSparkles } from 'lucide-react';

import type { UploadedResume } from '@/src/shared/api/resumes';

type Props = {
  resume: UploadedResume;
};

function isResumeAnalyzed(resume: UploadedResume) {
  return resume.analysis_status === 'completed' && resume.last_score !== null;
}

function createAnalyzeHref(resumeId: string) {
  const params = new URLSearchParams({
    resumeId,
    autoRun: '1',
  });

  return `/dashboard/analyze?${params.toString()}`;
}

function createActionItems(resume: UploadedResume) {
  const analyzed = isResumeAnalyzed(resume);

  return [
    {
      title: analyzed ? 'Резюме уже оценено' : 'Оценить резюме',
      description: analyzed
        ? 'Нажмите, чтобы запустить повторную проверку.'
        : 'Сразу запустим оценку резюме и покажем рекомендации.',
      href: createAnalyzeHref(resume.id),
      icon: BarChart3,
      badge: analyzed ? 'повторная оценка' : null,
    },
    {
      title: 'Адаптировать под вакансию',
      description: 'Создать версию под конкретное описание.',
      href: `/dashboard/adapt?resumeId=${resume.id}`,
      icon: WandSparkles,
      badge: null,
    },
  ];
}

export function ResumeActionsPanel({ resume }: Props) {
  const actions = createActionItems(resume);

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <h2 className="text-xl font-medium text-foreground">
        Что можно сделать дальше
      </h2>

      <div className="mt-5 space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="flex items-start gap-4 rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-muted"
            >
              <div className="rounded-xl bg-muted p-3">
                <Icon className="h-5 w-5 text-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{action.title}</p>

                  {action.badge ? (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                      {action.badge}
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}