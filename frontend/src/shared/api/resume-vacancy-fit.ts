import type { NormalizedVacancy } from './vacancies';
import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type ResumeVacancyFitLevel =
  | 'impossible'
  | 'weak'
  | 'partial'
  | 'solid'
  | 'strong';

export type ResumeVacancyCareerMove =
  | 'same_role'
  | 'adjacent_role'
  | 'stretch_role'
  | 'career_change'
  | 'unknown';

export type ResumeVacancyAdaptationMode = 'safe' | 'limited' | 'blocked';

export type ResumeVacancyFitRiskFlag = {
  type:
    | 'role_mismatch'
    | 'missing_core_experience'
    | 'missing_required_skill'
    | 'level_mismatch'
    | 'domain_mismatch'
    | 'weak_evidence'
    | 'career_change'
    | 'over_adaptation_risk';
  severity: 'minor' | 'major' | 'critical';
  explanation: string;
};

export type ResumeVacancyFitResult = {
  canAdapt: boolean;
  fit: ResumeVacancyFitLevel;
  score: number;
  confidence: number;

  resumeRole: string | null;
  vacancyRole: string | null;
  careerMove: ResumeVacancyCareerMove;
  adaptationMode: ResumeVacancyAdaptationMode;

  reason: string;
  safeAdaptationDirection: string | null;

  matchedRequirements: string[];
  transferableExperience: string[];
  gaps: string[];
  blockingGaps: string[];

  allowedChanges: string[];
  forbiddenChanges: string[];

  riskFlags: ResumeVacancyFitRiskFlag[];
};

export type ResumeVacancyFitResponse = {
  status: 'fit_passed' | 'fit_blocked';
  resumeId: string;
  fit: ResumeVacancyFitResult;
  meta: {
    resumeChars: number;
    vacancyChars: number;
    markdownChars: number;
    markdownLimited: boolean;
    provider: string;
    model: string;
  };
};

export async function checkResumeVacancyFit(params: {
  resumeId: string;
  vacancy: NormalizedVacancy;
  vacancyText: string;
  accessToken: string;
}): Promise<ResumeVacancyFitResponse> {
  const response = await fetch(
    `${getApiUrl()}/api/resumes/${params.resumeId}/vacancy-fit`,
    {
      method: 'POST',
      headers: {
        ...createAuthHeaders(params.accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vacancy: params.vacancy,
        vacancyText: params.vacancyText,
      }),
    }
  );

  return parseApiResponse<ResumeVacancyFitResponse>(
    response,
    'Failed to check resume vacancy fit'
  );
}