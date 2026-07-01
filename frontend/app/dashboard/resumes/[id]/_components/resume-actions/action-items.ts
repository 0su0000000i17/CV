import {
  BarChart3,
  LayoutDashboard,
  Mail,
  WandSparkles,
} from 'lucide-react';

import type { UploadedResume } from '@/src/shared/api/resumes';

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

export function createActionItems(resume: UploadedResume) {
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
