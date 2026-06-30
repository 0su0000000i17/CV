import type { ResumeAdaptationResponse } from './resume-adaptation';
import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type { ResumeAdaptationResponse };

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

  return parseApiResponse<ResumeAdaptationResponse>(
    response,
    'Failed to improve resume'
  );
}
