import { parseHhLayout } from "../resume-document/hh-layout/parse-hh-layout.js";
import type { SourceResumeDocument } from "../resume-document/types.js";
import { limitResumeMarkdown } from "./limit-resume-markdown.js";
import { normalizeResumeMarkdown } from "./normalize-resume-markdown.js";
import { looksLikeHhLayout } from "./pdf-layout/hh-reading-order.js";
import { extractPdfLayout } from "./pdf-layout/extract-pdf-layout.js";
import { sanitizeResumeMarkdownForAi } from "./sanitize-resume-markdown-for-ai.js";

type ExtractHhResumeParams = {
  fileBuffer: Buffer;
  mimeType?: string | null;
};

export type HhResumeExtraction = {
  document: SourceResumeDocument;
  rawMarkdown: string;
  normalizedMarkdown: string;
  sanitizedMarkdown: string;
  markdown: string;
  stats: {
    pages: number;
    layoutLines: number;
    experienceItems: number;
    rawChars: number;
    normalizedChars: number;
    sanitizedChars: number;
    returnedChars: number;
    maxChars: number;
    limited: boolean;
  };
};

export class UnsupportedHhResumeError extends Error {
  constructor() {
    super("The uploaded PDF is not a supported HH resume");
    this.name = "UnsupportedHhResumeError";
  }
}

export async function extractHhResume(
  params: ExtractHhResumeParams
): Promise<HhResumeExtraction> {
  const layout = await extractPdfLayout(params);
  if (!looksLikeHhLayout(layout)) {
    throw new UnsupportedHhResumeError();
  }

  const parsedLayout = parseHhLayout(layout);
  const normalizedMarkdown = normalizeResumeMarkdown(parsedLayout.text);
  const sanitizedMarkdown = sanitizeResumeMarkdownForAi(normalizedMarkdown);
  const limited = limitResumeMarkdown(sanitizedMarkdown);
  const document: SourceResumeDocument = parsedLayout.document;

  return {
    document,
    rawMarkdown: normalizedMarkdown,
    normalizedMarkdown,
    sanitizedMarkdown,
    markdown: limited.markdown,
    stats: {
      pages: layout.pages.length,
      layoutLines: layout.pages.reduce((sum, page) => sum + page.lines.length, 0),
      experienceItems: parsedLayout.experienceItems,
      rawChars: normalizedMarkdown.length,
      normalizedChars: normalizedMarkdown.length,
      sanitizedChars: sanitizedMarkdown.length,
      returnedChars: limited.returnedChars,
      maxChars: limited.maxChars,
      limited: limited.limited,
    },
  };
}
