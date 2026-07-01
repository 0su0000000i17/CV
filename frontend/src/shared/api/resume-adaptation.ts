import type { ResumeVacancyFitResult } from './resume-vacancy-fit';
import type { NormalizedVacancy } from './vacancies';
import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type AdaptationSettings = {
  preserveAuthorStyle: boolean;
  strengthenAchievements: boolean;
  optimizeForAts: boolean;
  tailorSkillsToVacancy: boolean;
  makeTextMoreSpecific: boolean;
};

export type AdaptedResumeSkills = {
  primary: string[];
  secondary: string[];
  deprioritized: string[];
  notAdded: string[];
};

export type AdaptedResumeExperienceItem = {
  sourceIndex: number;
  company: string | null;
  companyUrl?: string | null;
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

export type ResumeAdaptationTarget = {
  title: string | null;
  company: string | null;
  seniority: string | null;
  salary: string | null;
  specializations: string[];
  employment: string | null;
  schedule: string | null;
  workFormat: string | null;
  commuteTime: string | null;
  keywordsUsed: string[];
};

export type ResumeAdaptationResult = {
  target: ResumeAdaptationTarget;
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

type ResumeAdaptationTaskResponse = {
  status: 'queued' | 'running' | 'failed';
  taskId: string;
  resumeId: string;
  attempts?: number;
  error?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ResumeAdaptationApiResponse = ResumeAdaptationResponse | ResumeAdaptationTaskResponse;

const ADAPTATION_POLL_INTERVAL_MS = Number(
  process.env.NEXT_PUBLIC_ADAPTATION_POLL_INTERVAL_MS
) || 2_500;
const ADAPTATION_MAX_POLLS = Number(process.env.NEXT_PUBLIC_ADAPTATION_MAX_POLLS) || 240;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAdaptedResponse(value: ResumeAdaptationApiResponse): value is ResumeAdaptationResponse {
  return value.status === 'adapted';
}

async function fetchAdaptationStatus(params: {
  resumeId: string;
  taskId: string;
  accessToken: string;
}) {
  const response = await fetch(
    `${getApiUrl()}/api/resumes/${params.resumeId}/adapt/status/${params.taskId}`,
    {
      method: 'GET',
      headers: createAuthHeaders(params.accessToken),
    }
  );

  return parseApiResponse<ResumeAdaptationApiResponse>(
    response,
    'Failed to get resume adaptation status'
  );
}

async function waitForAdaptationResult(params: {
  resumeId: string;
  taskId: string;
  accessToken: string;
}) {
  for (let attempt = 0; attempt < ADAPTATION_MAX_POLLS; attempt += 1) {
    await sleep(ADAPTATION_POLL_INTERVAL_MS);
    const result = await fetchAdaptationStatus(params);

    if (isAdaptedResponse(result)) {
      return result;
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Failed to adapt resume to vacancy');
    }
  }

  throw new Error('Resume adaptation is taking too long. Try again later.');
}

export async function adaptResumeToVacancy(params: {
  resumeId: string;
  vacancy: NormalizedVacancy;
  vacancyText: string;
  fit: ResumeVacancyFitResult;
  accessToken: string;
}): Promise<ResumeAdaptationResponse> {
  const response = await fetch(`${getApiUrl()}/api/resumes/${params.resumeId}/adapt`, {
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
  });

  const result = await parseApiResponse<ResumeAdaptationApiResponse>(
    response,
    'Failed to adapt resume to vacancy'
  );

  if (isAdaptedResponse(result)) {
    return result;
  }

  if (result.status === 'failed') {
    throw new Error(result.error || 'Failed to adapt resume to vacancy');
  }

  return waitForAdaptationResult({
    resumeId: params.resumeId,
    taskId: result.taskId,
    accessToken: params.accessToken,
  });
}
