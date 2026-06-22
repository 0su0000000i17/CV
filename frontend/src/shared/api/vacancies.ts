import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type PageExtractionStatus =
  | 'success'
  | 'invalid_url'
  | 'blocked_url'
  | 'render_failed'
  | 'access_denied'
  | 'captcha_or_bot_check'
  | 'content_too_short'
  | 'not_vacancy'
  | 'ai_failed'
  | 'needs_manual_text';

export type ExtractedPage = {
  title: string | null;
  description: string | null;
  text: string;
  textLength: number;
  isTextLimited: boolean;
};

export type NormalizedVacancy = {
  isVacancy: boolean;
  rejectionReason: string | null;

  title: string | null;
  company: string | null;
  location: string | null;
  salary: string | null;
  employment: string | null;
  workFormat: string | null;
  schedule: string | null;
  seniority: string | null;

  summary: string | null;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  conditions: string[];
  skills: string[];

  warnings: string[];
  confidence: number | null;
};

export type PageExtractionResponse = {
  status: PageExtractionStatus;
  message: string;
  sourceUrl?: string;
  finalUrl?: string;
  method: 'playwright_rendered_dom' | 'pasted_text';
  confidence: number;
  page?: ExtractedPage;
  vacancy?: NormalizedVacancy;
};

export async function extractVacancyPageFromUrl(
  url: string,
  accessToken: string
): Promise<PageExtractionResponse> {
  const response = await fetch(`${getApiUrl()}/api/vacancies/extract-url`, {
    method: 'POST',
    headers: {
      ...createAuthHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
    }),
  });

  return parseApiResponse<PageExtractionResponse>(
    response,
    'Failed to extract page text'
  );
}

export async function prepareVacancyInput(
  input: string,
  accessToken: string
): Promise<PageExtractionResponse> {
  const response = await fetch(`${getApiUrl()}/api/vacancies/prepare`, {
    method: 'POST',
    headers: {
      ...createAuthHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input,
    }),
  });

  return parseApiResponse<PageExtractionResponse>(
    response,
    'Failed to prepare vacancy'
  );
}