import type { ResumeAdaptationResult } from './resume-adaptation';
import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type CoverLetterTone =
  | 'strict_professional'
  | 'friendly_neutral'
  | 'confident_short';

export type GenerateCoverLetterParams = {
  resumeId: string;
  vacancyText: string;
  tone: CoverLetterTone;
  accessToken: string;
  adaptation?: ResumeAdaptationResult;
};

export type CoverLetterResponse = {
  status: 'generated';
  resumeId: string;
  coverLetter: string;
  warnings: string[];
  meta: {
    resumeChars: number;
    vacancyChars: number;
    markdownChars: number;
    markdownLimited: boolean;
    contactSignatureAppended: boolean;
    tone: CoverLetterTone;
    usedAdaptation: boolean;
    provider: string;
    model: string;
  };
};

export async function generateCoverLetter({
  resumeId,
  vacancyText,
  tone,
  accessToken,
  adaptation,
}: GenerateCoverLetterParams) {
  const response = await fetch(`${getApiUrl()}/api/cover-letters/generate`, {
    method: 'POST',
    headers: {
      ...createAuthHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      resumeId,
      vacancyText,
      tone,
      adaptation,
    }),
  });

  return parseApiResponse<CoverLetterResponse>(
    response,
    'Failed to generate cover letter'
  );
}