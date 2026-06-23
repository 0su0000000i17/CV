import type { ResumeVacancyFitResult } from './resumeVacancyFit';
import type { NormalizedVacancy } from './vacancies';
import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type AdaptedResumeSkills = {
  primary: string[];
  secondary: string[];
  deprioritized: string[];
  notAdded: string[];
};

export type AdaptedResumeExperienceItem = {
  sourceIndex: number;
  company: string | null;
  position: string | null;
  dates: string | null;
  adaptedBullets: string[];
  focus: string | null;
  preservedFacts: string[];
  warnings: string[];
};

export type AdaptedResumeEducation = {
  policy: 'unchanged' | 'lightly_reordered' | 'not_found';
  notes: string[];
};

export type ResumeAdaptationResult = {
  target: {
    title: string | null;
    company: string | null;
    seniority: string | null;
    keywordsUsed: string[];
  };
  adaptedResume: {
    headline: string;
    summary: string;
    skills: AdaptedResumeSkills;
    experience: AdaptedResumeExperienceItem[];
    education: AdaptedResumeEducation;
    additionalInfo: string[];
  };
  changes: string[];
  warnings: string[];
  forbiddenClaims: string[];
};

export type ResumeAdaptationResponse = {
  status: 'adapted';
  resumeId: string;
  adaptation: ResumeAdaptationResult;
  meta: {
    resumeChars: number;
    vacancyChars: number;
    markdownChars: number;
    markdownLimited: boolean;
    provider: string;
    model: string;
  };
};

export async function adaptResumeToVacancy(params: {
  resumeId: string;
  vacancy: NormalizedVacancy;
  vacancyText: string;
  fit: ResumeVacancyFitResult;
  accessToken: string;
}): Promise<ResumeAdaptationResponse> {
  const response = await fetch(
    `${getApiUrl()}/api/resumes/${params.resumeId}/adapt`,
    {
      method: 'POST',
      headers: {
        ...createAuthHeaders(params.accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vacancy: params.vacancy,
        vacancyText: params.vacancyText,
        fit: params.fit,
      }),
    }
  );

  return parseApiResponse<ResumeAdaptationResponse>(
    response,
    'Failed to adapt resume to vacancy'
  );
}