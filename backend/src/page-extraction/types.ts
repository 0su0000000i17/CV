export type PageExtractionStatus =
  | "success"
  | "invalid_url"
  | "blocked_url"
  | "render_failed"
  | "access_denied"
  | "captcha_or_bot_check"
  | "content_too_short"
  | "not_vacancy"
  | "ai_failed"
  | "needs_manual_text";

export type PageExtractionMethod = "playwright_rendered_dom" | "pasted_text";

export type StructuredJobPosting = {
  title: string; company: string; location: string; employment: string;
  workHours: string; salary: string; description: string; responsibilities: string;
  qualifications: string; skills: string; experienceRequirements: string;
  educationRequirements: string;
};

type ExtractedPage = {
  title: string | null;
  description: string | null;
  text: string;
  textLength: number;
  isTextLimited: boolean;
  structuredVacancy?: StructuredJobPosting | null;
};

export type PageExtractionResult = {
  status: PageExtractionStatus;
  message: string;
  sourceUrl?: string;
  finalUrl?: string;
  method: PageExtractionMethod;
  confidence: number;
  page?: ExtractedPage;
};

export type ParsedPublicUrlResult =
  | {
      ok: true;
      url: URL;
    }
  | {
      ok: false;
      status: PageExtractionStatus;
      message: string;
    };
