import type { ResumeAdaptationResponse } from './resume-adaptation';
import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type { ResumeAdaptationResponse };

type ResumeImprovementTaskResponse = {
  status: 'queued' | 'running' | 'failed';
  taskId: string;
  resumeId: string;
  attempts?: number;
  error?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ResumeImprovementApiResponse = ResumeAdaptationResponse | ResumeImprovementTaskResponse;

const IMPROVEMENT_POLL_INTERVAL_MS = Number(
  process.env.NEXT_PUBLIC_IMPROVEMENT_POLL_INTERVAL_MS ||
    process.env.NEXT_PUBLIC_ADAPTATION_POLL_INTERVAL_MS
) || 2_500;
const IMPROVEMENT_MAX_POLLS = Number(
  process.env.NEXT_PUBLIC_IMPROVEMENT_MAX_POLLS ||
    process.env.NEXT_PUBLIC_ADAPTATION_MAX_POLLS
) || 240;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isImprovedResponse(value: ResumeImprovementApiResponse): value is ResumeAdaptationResponse {
  return value.status === 'adapted';
}

async function fetchImprovementStatus(params: {
  resumeId: string;
  taskId: string;
  accessToken: string;
}) {
  const response = await fetch(
    `${getApiUrl()}/api/ai/resume-tools/${params.resumeId}/status/${params.taskId}`,
    {
      method: 'GET',
      headers: createAuthHeaders(params.accessToken),
    }
  );

  return parseApiResponse<ResumeImprovementApiResponse>(
    response,
    'Failed to get resume improvement status'
  );
}

async function waitForImprovementResult(params: {
  resumeId: string;
  taskId: string;
  accessToken: string;
}) {
  for (let attempt = 0; attempt < IMPROVEMENT_MAX_POLLS; attempt += 1) {
    await sleep(IMPROVEMENT_POLL_INTERVAL_MS);
    const result = await fetchImprovementStatus(params);

    if (isImprovedResponse(result)) {
      return result;
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Failed to improve resume');
    }
  }

  throw new Error('Resume improvement is taking too long. Try again later.');
}

export async function improveResume(params: {
  resumeId: string;
  accessToken: string;
}): Promise<ResumeAdaptationResponse> {
  const response = await fetch(`${getApiUrl()}/api/ai/resume-tools/${params.resumeId}`, {
    method: 'POST',
    headers: {
      ...createAuthHeaders(params.accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'improve_resume' }),
  });

  const result = await parseApiResponse<ResumeImprovementApiResponse>(
    response,
    'Failed to improve resume'
  );

  if (isImprovedResponse(result)) {
    return result;
  }

  if (result.status === 'failed') {
    throw new Error(result.error || 'Failed to improve resume');
  }

  return waitForImprovementResult({
    resumeId: params.resumeId,
    taskId: result.taskId,
    accessToken: params.accessToken,
  });
}
