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

export type ExtractedPage = {
  title: string | null;
  description: string | null;
  text: string;
  textLength: number;
  isTextLimited: boolean;
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