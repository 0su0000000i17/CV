import Link from 'next/link';
import { BriefcaseBusiness } from 'lucide-react';

import { AdaptationResultCard } from '@/src/features/resume-editor/adaptation/result-card';

import type { ResumeAdaptationResponse } from '@/src/shared/api/resume-adaptation';
import type {
  ResumeProfileExtractionResponse,
  UploadedResume,
} from '@/src/shared/api/resumes';
import type { NormalizedVacancy } from '@/src/shared/api/vacancies';

type Props = {
  adaptationResponse?: ResumeAdaptationResponse;
  profileExtraction?: ResumeProfileExtractionResponse;
  sourceResume?: UploadedResume;
  accessToken?: string | null;
  vacancyText: string;
  vacancy?: NormalizedVacancy | null;
  vacancyInput?: string;
  isAdapting: boolean;
  isError: boolean;
  error: unknown;
  isProfileLoading: boolean;
  onResetAdaptation: () => void;
};

export function GeneratedResumeWorkspace({
  adaptationResponse,
  profileExtraction,
  sourceResume,
  accessToken,
  vacancyText,
  vacancy,
  vacancyInput,
  isAdapting,
  isError,
  error,
  isProfileLoading,
  onResetAdaptation,
}: Props) {
  const trackingHref = createTrackingHref({
    adaptationResponse,
    sourceResume,
    vacancy,
    vacancyInput,
  });

  return (
    <div className="space-y-5">
      {trackingHref ? (
        <section className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.018] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-white/65">
              <BriefcaseBusiness className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-medium text-white">Адаптация готова к отклику</h2>
              <p className="mt-1 text-sm leading-6 text-white/40">
                Добавьте вакансию в трекер — результат этой версии попадёт в статистику.
              </p>
            </div>
          </div>
          <Link
            href={trackingHref}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-4 text-sm font-medium text-white transition-colors hover:bg-white/[0.1]"
          >
            <BriefcaseBusiness className="h-4 w-4" />
            Добавить отклик
          </Link>
        </section>
      ) : null}

      <AdaptationResultCard
        adaptationResponse={adaptationResponse}
        profileExtraction={profileExtraction}
        sourceResume={sourceResume}
        accessToken={accessToken}
        vacancyText={vacancyText}
        isAdapting={isAdapting}
        isError={isError}
        isProfileLoading={isProfileLoading}
        errorMessage={error instanceof Error ? error.message : undefined}
        onResetAdaptation={onResetAdaptation}
      />
    </div>
  );
}

function createTrackingHref(params: {
  adaptationResponse?: ResumeAdaptationResponse;
  sourceResume?: UploadedResume;
  vacancy?: NormalizedVacancy | null;
  vacancyInput?: string;
}) {
  if (!params.adaptationResponse || !params.sourceResume) return null;
  const title =
    params.vacancy?.title ||
    params.adaptationResponse.adaptation.target.title ||
    'Вакансия';
  const query = new URLSearchParams({
    resumeId: params.sourceResume.id,
    title,
    variant: `Адаптация · ${title}`,
  });
  if (params.vacancy?.company) query.set('company', params.vacancy.company);
  if (/^https?:\/\//iu.test(params.vacancyInput?.trim() || '')) {
    query.set('url', params.vacancyInput!.trim());
  }
  return `/dashboard/applications?${query.toString()}`;
}
