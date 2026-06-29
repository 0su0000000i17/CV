'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Target,
  Upload,
} from 'lucide-react';

import { useDashboardResumeSelection } from './_components/dashboard-resume-selection-provider';
import { UploadResumeButton } from './resumes/_components/upload-resume-button';

import type { UploadedResume } from '@/src/shared/api/resumes';
import { useAuth } from '@/src/shared/hooks/use-auth';
import { useProfileQuery } from '@/src/shared/hooks/use-profile-query';
import { useResumesQuery } from '@/src/shared/hooks/use-resumes-query';

function getFirstName(fullName?: string, email?: string) {
  const trimmedName = fullName?.trim();

  if (trimmedName) {
    return trimmedName.split(/\s+/)[0];
  }

  const emailName = email?.split('@')[0]?.trim();

  if (emailName) {
    return emailName;
  }

  return 'пользователь';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function getScoreColorClass(score: number | null | undefined) {
  if (score === null || score === undefined) {
    return 'text-muted-foreground';
  }

  if (score >= 80) {
    return 'text-emerald-400';
  }

  if (score >= 60) {
    return 'text-orange-400';
  }

  return 'text-red-400';
}

function getScoreBarClass(score: number | null | undefined) {
  if (score === null || score === undefined) {
    return 'bg-muted-foreground/30';
  }

  if (score >= 80) {
    return 'bg-emerald-400';
  }

  if (score >= 60) {
    return 'bg-orange-400';
  }

  return 'bg-red-400';
}

function getAnalysisStatusLabel(resume: UploadedResume) {
  switch (resume.analysis_status) {
    case 'completed':
      return 'Оценено';

    case 'analyzing':
      return 'Оценивается';

    case 'failed':
      return 'Ошибка оценки';

    case 'needs_update':
      return 'Нужно обновить';

    case 'idle':
    case 'not_started':
    default:
      return 'Не оценено';
  }
}

function getAnalysisStatusClass(resume: UploadedResume) {
  switch (resume.analysis_status) {
    case 'completed':
      return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300';

    case 'analyzing':
      return 'border-blue-500/25 bg-blue-500/10 text-blue-300';

    case 'failed':
      return 'border-red-500/25 bg-red-500/10 text-red-300';

    case 'needs_update':
      return 'border-orange-500/25 bg-orange-500/10 text-orange-300';

    case 'idle':
    case 'not_started':
    default:
      return 'border-border bg-muted text-muted-foreground';
  }
}

function getResumeScoreLabel(resume: UploadedResume) {
  if (resume.analysis_status !== 'completed' || resume.last_score === null) {
    return '—';
  }

  return `${resume.last_score}/100`;
}

function getCheckedResumes(resumes: UploadedResume[]) {
  return resumes.filter(
    (resume) => resume.analysis_status === 'completed' && resume.last_score !== null
  );
}

function getAverageScore(resumes: UploadedResume[]) {
  const checkedResumes = getCheckedResumes(resumes);

  if (!checkedResumes.length) {
    return null;
  }

  const totalScore = checkedResumes.reduce(
    (sum, resume) => sum + (resume.last_score ?? 0),
    0
  );

  return Math.round(totalScore / checkedResumes.length);
}

function getLatestCheckedResume(resumes: UploadedResume[]) {
  return [...getCheckedResumes(resumes)].sort(
    (firstResume, secondResume) =>
      new Date(secondResume.updated_at).getTime() -
      new Date(firstResume.updated_at).getTime()
  )[0];
}

function createResumeActionHref(
  path: '/dashboard/analyze' | '/dashboard/adapt',
  resumeId?: string
) {
  if (!resumeId) {
    return path;
  }

  return `${path}?resumeId=${resumeId}`;
}

type StatCardProps = {
  label: string;
  value: string;
  caption: string;
  icon: ReactNode;
  iconClassName: string;
  valueClassName?: string;
};

function StatCard({
  label,
  value,
  caption,
  icon,
  iconClassName,
  valueClassName = 'text-foreground',
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </p>

        <div className={`rounded-xl border p-2.5 ${iconClassName}`}>{icon}</div>
      </div>

      <p className={`text-3xl font-semibold tracking-tight ${valueClassName}`}>
        {value}
      </p>

      <p className="mt-2 text-sm text-muted-foreground">{caption}</p>
    </div>
  );
}

function ResumeRow({ resume }: { resume: UploadedResume }) {
  const scoreWidth =
    resume.analysis_status === 'completed' && resume.last_score !== null
      ? resume.last_score
      : 0;

  return (
    <div className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-muted/30 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 items-start gap-4 lg:pr-5">
        <div className="shrink-0 rounded-xl bg-blue-500/10 p-3 text-blue-300 ring-1 ring-blue-500/20">
          <FileText className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <Link
            href={`/dashboard/resumes/${resume.id}`}
            title={resume.title}
            className="block max-w-full truncate text-sm font-medium text-foreground hover:underline"
          >
            {resume.title}
          </Link>

          <p
            title={resume.role || 'Роль не указана'}
            className="mt-1 max-w-full truncate text-xs text-muted-foreground"
          >
            {resume.role || 'Роль не указана'}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getAnalysisStatusClass(
                resume
              )}`}
            >
              {getAnalysisStatusLabel(resume)}
            </span>

            <span
              className={`text-sm font-semibold ${getScoreColorClass(
                resume.last_score
              )}`}
            >
              {getResumeScoreLabel(resume)}
            </span>

            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {formatDate(resume.created_at)}
            </span>
          </div>

          <div className="mt-3 h-1.5 w-full max-w-[180px] rounded-full bg-muted">
            <div
              className={`h-1.5 rounded-full ${getScoreBarClass(resume.last_score)}`}
              style={{ width: `${scoreWidth}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
        <Link
          href={`/dashboard/resumes/${resume.id}`}
          className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          Открыть
        </Link>

        <Link
          href={`/dashboard/analyze?resumeId=${resume.id}`}
          className="inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2 text-xs font-medium text-background transition-colors hover:bg-foreground/80"
        >
          Оценить
        </Link>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-56 animate-pulse rounded-3xl bg-muted" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="h-36 animate-pulse rounded-2xl bg-muted" />
        <div className="h-36 animate-pulse rounded-2xl bg-muted" />
        <div className="h-36 animate-pulse rounded-2xl bg-muted" />
        <div className="h-36 animate-pulse rounded-2xl bg-muted" />
      </div>

      <div className="h-80 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

export default function DashboardPage() {
  const { selectedResumeId, setSelectedResumeId } =
    useDashboardResumeSelection();

  const { accessToken, user } = useAuth();
  const profileQuery = useProfileQuery(accessToken);
  const resumesQuery = useResumesQuery(accessToken);

  const profile = profileQuery.data?.profile;
  const resumes = resumesQuery.data?.resumes ?? [];

  const firstName = getFirstName(
    profile?.full_name,
    profile?.email || user?.email
  );

  const checkedResumes = getCheckedResumes(resumes);
  const averageScore = getAverageScore(resumes);
  const latestCheckedResume = getLatestCheckedResume(resumes);
  const recentResumes = resumes.slice(0, 4);

  const selectedResumeExists = selectedResumeId
    ? resumes.some((resume) => resume.id === selectedResumeId)
    : false;

  const actionResumeId =
    selectedResumeExists && selectedResumeId
      ? selectedResumeId
      : latestCheckedResume?.id ?? resumes[0]?.id;

  const analyzeHref = createResumeActionHref('/dashboard/analyze', actionResumeId);
  const adaptHref = createResumeActionHref('/dashboard/adapt', actionResumeId);

  const isLoading = resumesQuery.isLoading || profileQuery.isLoading;

  function handleUploadedResume(resume: UploadedResume) {
    setSelectedResumeId(resume.id);
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      <section className="rounded-3xl border border-border bg-card/60 p-6 md:p-8 xl:p-10">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Личный кабинет / Обзор
        </p>

        <h1 className="max-w-3xl text-4xl font-normal tracking-tight text-foreground md:text-5xl">
          Привет, {firstName}
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Здесь видно состояние ваших резюме, последние оценки и следующие
          действия перед откликом: начните с загрузки файла, оценки резюме или
          адаптации под конкретную вакансию
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <UploadResumeButton
            icon={<Upload className="h-4 w-4" />}
            errorAlign="left"
            onUploaded={handleUploadedResume}
          >
            Загрузить резюме
          </UploadResumeButton>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Всего резюме"
          value={String(resumes.length)}
          caption="Файлы в личном кабинете"
          icon={<FileText className="h-5 w-5" />}
          iconClassName="border-blue-500/20 bg-blue-500/10 text-blue-300"
        />

        <StatCard
          label="Оценено"
          value={`${checkedResumes.length}/${resumes.length}`}
          caption="Резюме с готовой оценкой"
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconClassName="border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
        />

        <StatCard
          label="Средний score"
          value={averageScore === null ? '—' : `${averageScore}/100`}
          caption="По всем оцененным резюме"
          icon={<BarChart3 className="h-5 w-5" />}
          iconClassName="border-orange-500/20 bg-orange-500/10 text-orange-300"
          valueClassName={getScoreColorClass(averageScore)}
        />

        <StatCard
          label="Последняя оценка"
          value={
            latestCheckedResume?.last_score === null ||
            latestCheckedResume?.last_score === undefined
              ? '—'
              : `${latestCheckedResume.last_score}/100`
          }
          caption={
            latestCheckedResume
              ? latestCheckedResume.title
              : 'Оценка ещё не запускалась'
          }
          icon={<Clock3 className="h-5 w-5" />}
          iconClassName="border-violet-500/20 bg-violet-500/10 text-violet-300"
          valueClassName={getScoreColorClass(latestCheckedResume?.last_score)}
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
          <div className="flex flex-col gap-4 border-b border-border p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-medium text-foreground">
                Последние резюме
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Быстрый доступ к файлам, оценкам и повторной проверке
              </p>
            </div>

            <Link
              href="/dashboard/resumes"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Все резюме
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {resumesQuery.isError ? (
            <div className="p-6">
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5">
                <p className="text-sm font-medium text-red-300">
                  Не удалось загрузить резюме
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  Обновите страницу или попробуйте позже
                </p>
              </div>
            </div>
          ) : recentResumes.length > 0 ? (
            <div className="divide-y divide-border">
              {recentResumes.map((resume) => (
                <ResumeRow key={resume.id} resume={resume} />
              ))}
            </div>
          ) : (
            <div className="p-6">
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
                  <Plus className="h-5 w-5" />
                </div>

                <p className="text-base font-medium text-foreground">
                  У вас пока нет загруженных резюме
                </p>

                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Загрузите первое резюме, чтобы получить оценку, детализацию по
                  метрикам и рекомендации по улучшению
                </p>

                <div className="mt-5 flex justify-center">
                  <UploadResumeButton
                    icon={<Upload className="h-4 w-4" />}
                    errorAlign="left"
                    onUploaded={handleUploadedResume}
                  >
                    Загрузить резюме
                  </UploadResumeButton>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Что дальше
            </p>

            <div className="mt-5 space-y-3">
              <Link
                href={analyzeHref}
                className="group flex items-start gap-4 rounded-2xl border border-border p-4 transition-colors hover:bg-muted/40"
              >
                <div className="shrink-0 rounded-xl bg-orange-500/10 p-3 text-orange-300 ring-1 ring-orange-500/20 transition-colors group-hover:bg-orange-500/15">
                  <BarChart3 className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    Оценить резюме
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Запустите анализ структуры, опыта, ATS и проблемных мест
                  </p>
                </div>
              </Link>

              <Link
                href={adaptHref}
                className="group flex items-start gap-4 rounded-2xl border border-border p-4 transition-colors hover:bg-muted/40"
              >
                <div className="shrink-0 rounded-xl bg-emerald-500/10 p-3 text-emerald-300 ring-1 ring-emerald-500/20 transition-colors group-hover:bg-emerald-500/15">
                  <Target className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    Адаптировать под вакансию
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Выберите резюме, вставьте вакансию и подготовьте версию под
                    требования работодателя
                  </p>
                </div>
              </Link>

              <Link
                href="/dashboard/resumes"
                className="group flex items-start gap-4 rounded-2xl border border-border p-4 transition-colors hover:bg-muted/40"
              >
                <div className="shrink-0 rounded-xl bg-blue-500/10 p-3 text-blue-300 ring-1 ring-blue-500/20 transition-colors group-hover:bg-blue-500/15">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    Управлять резюме
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Откройте список файлов, скачайте или удалите лишнее
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Подсказка
            </p>

            <h2 className="mt-4 text-lg font-medium text-foreground">
              Сначала оцените базовое резюме
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Чем понятнее структура, роль и доказательства опыта, тем легче
              потом адаптировать резюме под конкретные вакансии
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
