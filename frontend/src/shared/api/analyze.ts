import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';
import { pollTaskResult, pollingNumber } from './async-task-polling';
import type { AnalyzeResumeApiResponse, AnalyzeResumeResponse, LatestResumeAnalysisResponse } from './analyze.types';
export * from './analyze.types';

const interval = pollingNumber(
  process.env.NEXT_PUBLIC_ANALYSIS_POLL_INTERVAL_MS ||
    process.env.NEXT_PUBLIC_ADAPTATION_POLL_INTERVAL_MS,
  2_500, { min: 500, max: 30_000 }
);
const maxPolls = pollingNumber(
  process.env.NEXT_PUBLIC_ANALYSIS_MAX_POLLS || process.env.NEXT_PUBLIC_ADAPTATION_MAX_POLLS,
  240, { min: 1, max: 2_000 }
);
const completed = (value: AnalyzeResumeApiResponse): value is AnalyzeResumeResponse =>
  !('status' in value);
async function status(resumeId: string, taskId: string, token: string) {
  const response = await fetch(`${getApiUrl()}/api/resumes/${resumeId}/analyze/status/${taskId}`, {
    headers: createAuthHeaders(token),
  });
  return parseApiResponse<AnalyzeResumeApiResponse>(response, 'Failed to get resume analysis status');
}

export async function analyzeResume(resumeId: string, token: string, onQueued?: (balance: number) => void) {
  const response = await fetch(`${getApiUrl()}/api/resumes/${resumeId}/analyze`, {
    method: 'POST', headers: { ...createAuthHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const result = await parseApiResponse<AnalyzeResumeApiResponse>(response, 'Failed to analyze resume');
  if (completed(result)) return result;
  if (typeof result.balance === 'number') onQueued?.(result.balance);
  if (result.status === 'failed') throw new Error(result.error || 'Failed to analyze resume');
  const final = await pollTaskResult({ intervalMs: interval, maxPolls,
    fetchStatus: () => status(resumeId, result.taskId, token), isComplete: completed,
    failureMessage: (value) => 'status' in value && value.status === 'failed'
      ? value.error || 'Failed to analyze resume' : null,
    timeoutMessage: 'Resume analysis is taking too long. Try again later.' });
  if (!completed(final)) throw new Error('Invalid resume analysis response');
  return final;
}

export async function getLatestResumeAnalysis(resumeId: string, token: string) {
  const response = await fetch(`${getApiUrl()}/api/resumes/${resumeId}/analysis`, {
    headers: createAuthHeaders(token),
  });
  return parseApiResponse<LatestResumeAnalysisResponse>(response, 'Failed to fetch latest resume analysis');
}
