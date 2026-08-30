import type { ResumeVacancyFitResult } from './resume-vacancy-fit';
import type { NormalizedVacancy } from './vacancies';
import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';
import { pollTaskResult, pollingNumber } from './async-task-polling';
import type { ResumeAdaptationApiResponse, ResumeAdaptationResponse } from './resume-adaptation.types';
export * from './resume-adaptation.types';

const interval = pollingNumber(process.env.NEXT_PUBLIC_ADAPTATION_POLL_INTERVAL_MS,
  1_500, { min: 500, max: 30_000 });
const maxPolls = pollingNumber(process.env.NEXT_PUBLIC_ADAPTATION_MAX_POLLS,
  240, { min: 1, max: 2_000 });
const completed = (value: ResumeAdaptationApiResponse): value is ResumeAdaptationResponse =>
  value.status === 'adapted';
async function status(resumeId: string, taskId: string, token: string) {
  const response = await fetch(`${getApiUrl()}/api/resumes/${resumeId}/adapt/status/${taskId}`, {
    headers: createAuthHeaders(token),
  });
  return parseApiResponse<ResumeAdaptationApiResponse>(response, 'Failed to get resume adaptation status');
}

export async function adaptResumeToVacancy(params: {
  resumeId: string; vacancy: NormalizedVacancy; vacancyText: string;
  fit: ResumeVacancyFitResult; accessToken: string; sessionId?: string;
  onQueued?: (balance: number) => void;
}): Promise<ResumeAdaptationResponse> {
  const response = await fetch(`${getApiUrl()}/api/resumes/${params.resumeId}/adapt`, {
    method: 'POST', headers: { ...createAuthHeaders(params.accessToken),
      'Content-Type': 'application/json' },
    body: JSON.stringify({ vacancy: params.vacancy, vacancyText: params.vacancyText,
      fit: params.fit, sessionId: params.sessionId }),
  });
  const result = await parseApiResponse<ResumeAdaptationApiResponse>(response,
    'Failed to adapt resume to vacancy');
  if (completed(result)) return result;
  if (typeof result.balance === 'number') params.onQueued?.(result.balance);
  if (result.status === 'failed') throw new Error(result.error || 'Failed to adapt resume to vacancy');
  const final = await pollTaskResult({ intervalMs: interval, maxPolls,
    fetchStatus: () => status(params.resumeId, result.taskId, params.accessToken),
    isComplete: completed,
    failureMessage: (value) => value.status === 'failed'
      ? value.error || 'Failed to adapt resume to vacancy' : null,
    timeoutMessage: 'Resume adaptation is taking too long. Try again later.' });
  if (!completed(final)) throw new Error('Invalid resume adaptation response');
  return final;
}
