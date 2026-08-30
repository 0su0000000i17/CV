export type PageExtractionStatus = 'success' | 'invalid_url' | 'blocked_url' |
  'render_failed' | 'access_denied' | 'captcha_or_bot_check' | 'content_too_short' |
  'not_vacancy' | 'ai_failed' | 'needs_manual_text';
type ExtractedPage = {
  title: string | null; description: string | null; text: string;
  textLength: number; isTextLimited: boolean;
};
export type NormalizedVacancy = {
  isVacancy: boolean; rejectionReason: string | null; title: string | null;
  company: string | null; location: string | null; salary: string | null;
  employment: string | null; workFormat: string | null; schedule: string | null;
  seniority: string | null; summary: string | null; responsibilities: string[];
  requirements: string[]; niceToHave: string[]; conditions: string[];
  skills: string[]; candidateCriteria?: Array<{
    text: string; kind: 'skill' | 'experience' | 'domain' | 'education' | 'language' | 'seniority';
    priority: 'required' | 'preferred'; evidence: 'practice' | 'knowledge' | 'credential';
    source: 'requirement' | 'nice_to_have' | 'skill';
  }>; warnings: string[]; confidence: number | null;
};
export type PageExtractionResponse = {
  status: PageExtractionStatus; message: string; sourceUrl?: string; finalUrl?: string;
  method: 'playwright_rendered_dom' | 'pasted_text'; confidence: number;
  page?: ExtractedPage; vacancy?: NormalizedVacancy;
};
type VacancyPrepareTaskResponse = {
  status: 'queued' | 'running' | 'failed'; taskId: string; attempts?: number;
  error?: string | null; createdAt?: string; updatedAt?: string; balance?: number;
};
export type VacancyPrepareApiResponse = PageExtractionResponse | VacancyPrepareTaskResponse;
