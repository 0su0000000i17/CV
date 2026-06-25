import Link from 'next/link';
import {
  BarChart3,
  FileSearch,
  LayoutDashboard,
  Mail,
  WandSparkles,
} from 'lucide-react';

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
      title: 'Обзор',
      description: 'Вернуться на главный экран кабинета.',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
      tone: 'zinc',
    },
    {
      title: analyzed ? 'Резюме уже оценено' : 'Оценить резюме',
      description: analyzed
        ? 'Нажмите, чтобы запустить повторную проверку.'
        : 'Сразу запустим оценку резюме и покажем рекомендации.',
      href: createAnalyzeHref(resume.id),
      icon: BarChart3,
      badge: analyzed ? 'повторная оценка' : null,
      tone: 'blue',
    },
    {
      title: 'Адаптировать под вакансию',
      description: 'Создать версию под конкретное описание.',
      href: `/dashboard/adapt?resumeId=${resume.id}`,
      icon: WandSparkles,
      badge: 'рекомендуем',
      tone: 'green',
    },
    {
      title: 'Сопроводительное письмо',
      description: 'Сгенерировать профессиональный отклик к вакансии.',
      href: `/dashboard/cover-letter?resumeId=${resume.id}`,
      icon: Mail,
      badge: null,
      tone: 'violet',
    },
  ] as const;
}

function getToneClassName(tone: 'zinc' | 'blue' | 'green' | 'violet') {
  const tones = {
    zinc: {
      card: 'hover:bg-muted',
      icon: 'bg-muted text-foreground ring-border',
    },
    blue: {
      card: 'hover:border-blue-500/35 hover:bg-blue-500/5',
      icon: 'bg-blue-500/10 text-blue-300 ring-blue-500/20',
    },
    green: {
      card: 'border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10',
      icon: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25',
    },
    violet: {
      card: 'hover:border-violet-500/35 hover:bg-violet-500/5',
      icon: 'bg-violet-500/10 text-violet-300 ring-violet-500/20',
    },
  };

  return tones[tone];
}

export function ResumeActionsPanel({ resume }: Props) {
  const actions = createActionItems(resume);

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-300 ring-1 ring-emerald-500/20">
          <FileSearch className="h-5 w-5" />
        </div>

        <h2 className="text-xl font-medium text-foreground">
          Что можно сделать дальше
        </h2>
      </div>

      <div className="mt-5 space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const tone = getToneClassName(action.tone);

          return (
            <Link
              key={action.title}
              href={action.href}
              className={`flex cursor-pointer items-start gap-4 rounded-2xl border border-border bg-background p-4 transition-colors ${tone.card}`}
            >
              <div className={`rounded-xl p-3 ring-1 ${tone.icon}`}>
                <Icon className="h-5 w-5" />
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