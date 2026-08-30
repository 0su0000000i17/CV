import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';
import { pollTaskResult, pollingNumber } from './async-task-polling';
import type { PageExtractionResponse, VacancyPrepareApiResponse } from './vacancies.types';
export * from './vacancies.types';

const interval = pollingNumber(process.env.NEXT_PUBLIC_VACANCY_PREPARE_POLL_INTERVAL_MS ||
  process.env.NEXT_PUBLIC_ADAPTATION_POLL_INTERVAL_MS,
2_500, { min: 500, max: 30_000 });
const maxPolls = pollingNumber(process.env.NEXT_PUBLIC_VACANCY_PREPARE_MAX_POLLS ||
  process.env.NEXT_PUBLIC_ADAPTATION_MAX_POLLS,
240, { min: 1, max: 2_000 });
const completed = (value: VacancyPrepareApiResponse): value is PageExtractionResponse =>
  !['queued', 'running', 'failed'].includes(value.status);
async function status(taskId: string, token: string) {
  const response = await fetch(`${getApiUrl()}/api/vacancies/prepare/status/${taskId}`, {
    headers: createAuthHeaders(token),
  });
  return parseApiResponse<VacancyPrepareApiResponse>(response,
    'Failed to get vacancy preparation status');
}
export async function prepareVacancyInput(
  input: string,
  token: string,
  onQueued?: (balance: number) => void
): Promise<PageExtractionResponse> {
  const response = await fetch(`${getApiUrl()}/api/vacancies/prepare`, {
    method: 'POST', headers: { ...createAuthHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });
  const result = await parseApiResponse<VacancyPrepareApiResponse>(response,
    'Failed to prepare vacancy');
  if (completed(result)) return result;
  if (typeof result.balance === 'number') onQueued?.(result.balance);
  if (result.status === 'failed') throw new Error(result.error || 'Failed to prepare vacancy');
  const final = await pollTaskResult({ intervalMs: interval, maxPolls,
    fetchStatus: () => status(result.taskId, token), isComplete: completed,
    failureMessage: (value) => value.status === 'failed'
      ? value.error || 'Failed to prepare vacancy' : null,
    timeoutMessage: 'Vacancy preparation is taking too long. Try again later.' });
  if (!completed(final)) throw new Error('Invalid vacancy preparation response');
  return final;
}
