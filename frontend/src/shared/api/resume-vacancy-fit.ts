import type { NormalizedVacancy } from './vacancies';
import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';
import { pollTaskResult, pollingNumber } from './async-task-polling';
import type { ResumeVacancyFitApiResponse, ResumeVacancyFitResponse } from './resume-vacancy-fit.types';
export * from './resume-vacancy-fit.types';

const interval = pollingNumber(process.env.NEXT_PUBLIC_VACANCY_FIT_POLL_INTERVAL_MS ||
  process.env.NEXT_PUBLIC_ADAPTATION_POLL_INTERVAL_MS,
2_500, { min: 500, max: 30_000 });
const maxPolls = pollingNumber(process.env.NEXT_PUBLIC_VACANCY_FIT_MAX_POLLS ||
  process.env.NEXT_PUBLIC_ADAPTATION_MAX_POLLS,
240, { min: 1, max: 2_000 });
const completed = (value: ResumeVacancyFitApiResponse): value is ResumeVacancyFitResponse =>
  value.status === 'fit_passed' || value.status === 'fit_blocked';
async function status(resumeId: string, taskId: string, token: string) {
  const response = await fetch(
    `${getApiUrl()}/api/resumes/${resumeId}/vacancy-fit/status/${taskId}`,
    { headers: createAuthHeaders(token) }
  );
  return parseApiResponse<ResumeVacancyFitApiResponse>(response,
    'Failed to get resume vacancy fit status');
}
export async function checkResumeVacancyFit(params: {
  resumeId: string; vacancy: NormalizedVacancy; vacancyText: string;
  accessToken: string; onQueued?: (balance: number) => void;
}): Promise<ResumeVacancyFitResponse> {
  const response = await fetch(`${getApiUrl()}/api/resumes/${params.resumeId}/vacancy-fit`, {
    method: 'POST', headers: { ...createAuthHeaders(params.accessToken),
      'Content-Type': 'application/json' },
    body: JSON.stringify({ vacancy: params.vacancy, vacancyText: params.vacancyText }),
  });
  const result = await parseApiResponse<ResumeVacancyFitApiResponse>(response,
    'Failed to check resume vacancy fit');
  if (completed(result)) return result;
  if (typeof result.balance === 'number') params.onQueued?.(result.balance);
  if (result.status === 'failed') throw new Error(result.error || 'Failed to check resume vacancy fit');
  const final = await pollTaskResult({ intervalMs: interval, maxPolls,
    fetchStatus: () => status(params.resumeId, result.taskId, params.accessToken),
    isComplete: completed,
    failureMessage: (value) => value.status === 'failed'
      ? value.error || 'Failed to check resume vacancy fit' : null,
    timeoutMessage: 'Resume vacancy fit check is taking too long. Try again later.' });
  if (!completed(final)) throw new Error('Invalid resume vacancy fit response');
  return final;
}
