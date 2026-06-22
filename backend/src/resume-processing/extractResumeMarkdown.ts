import { extractMarkdownWithMarkitdown } from "./extractors/markitdownExtractor.js";
import { limitResumeMarkdown } from "./limitResumeMarkdown.js";
import { normalizeResumeMarkdown } from "./normalizeResumeMarkdown.js";
import { sanitizeResumeMarkdownForAi } from "./sanitizeResumeMarkdownForAi.js";

type ExtractResumeMarkdownParams = {
  fileBuffer: Buffer;
  fileName?: string | null;
  filePath?: string | null;
  mimeType?: string | null;
};

export async function extractResumeMarkdown(params: ExtractResumeMarkdownParams) {
  const rawMarkdown = await extractMarkdownWithMarkitdown(params);
  const normalizedMarkdown = normalizeResumeMarkdown(rawMarkdown);
  const sanitizedMarkdown = sanitizeResumeMarkdownForAi(normalizedMarkdown);
  const limitedMarkdown = limitResumeMarkdown(sanitizedMarkdown);

  return {
    rawMarkdown,
    normalizedMarkdown,
    sanitizedMarkdown,
    markdown: limitedMarkdown.markdown,
    stats: {
      rawChars: rawMarkdown.length,
      normalizedChars: normalizedMarkdown.length,
      sanitizedChars: sanitizedMarkdown.length,
      returnedChars: limitedMarkdown.returnedChars,
      maxChars: limitedMarkdown.maxChars,
      limited: limitedMarkdown.limited,
    },
  };
}