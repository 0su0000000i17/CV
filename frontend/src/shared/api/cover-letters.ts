import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';
import { pollTaskResult, pollingNumber } from './async-task-polling';
import type { CoverLetterApiResponse, CoverLetterResponse, GenerateCoverLetterParams } from './cover-letters.types';
export * from './cover-letters.types';

const interval = pollingNumber(process.env.NEXT_PUBLIC_COVER_LETTER_POLL_INTERVAL_MS ||
  process.env.NEXT_PUBLIC_ADAPTATION_POLL_INTERVAL_MS,
2_500, { min: 500, max: 30_000 });
const maxPolls = pollingNumber(process.env.NEXT_PUBLIC_COVER_LETTER_MAX_POLLS ||
  process.env.NEXT_PUBLIC_ADAPTATION_MAX_POLLS,
240, { min: 1, max: 2_000 });
const completed = (value: CoverLetterApiResponse): value is CoverLetterResponse =>
  value.status === 'generated';
async function status(taskId: string, token: string) {
  const response = await fetch(`${getApiUrl()}/api/cover-letters/generate/status/${taskId}`, {
    headers: createAuthHeaders(token),
  });
  return parseApiResponse<CoverLetterApiResponse>(response,
    'Failed to get cover letter status');
}
export async function generateCoverLetter(params: GenerateCoverLetterParams) {
  const response = await fetch(`${getApiUrl()}/api/cover-letters/generate`, {
    method: 'POST', headers: { ...createAuthHeaders(params.accessToken),
      'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeId: params.resumeId, vacancyText: params.vacancyText,
      tone: params.tone, adaptation: params.adaptation }),
  });
  const result = await parseApiResponse<CoverLetterApiResponse>(response,
    'Failed to generate cover letter');
  if (completed(result)) return result;
  if (typeof result.balance === 'number') params.onQueued?.(result.balance);
  if (result.status === 'failed') throw new Error(result.error || 'Failed to generate cover letter');
  const final = await pollTaskResult({ intervalMs: interval, maxPolls,
    fetchStatus: () => status(result.taskId, params.accessToken), isComplete: completed,
    failureMessage: (value) => value.status === 'failed'
      ? value.error || 'Failed to generate cover letter' : null,
    timeoutMessage: 'Cover letter generation is taking too long. Try again later.' });
  if (!completed(final)) throw new Error('Invalid cover letter response');
  return final;
}
