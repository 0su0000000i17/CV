import { extractMarkdownWithMarkitdown } from "./extractors/markitdown-extractor.js";
import { limitResumeMarkdown } from "./limit-resume-markdown.js";
import { normalizeResumeMarkdown } from "./normalize-resume-markdown.js";
import { sanitizeResumeMarkdownForAi } from "./sanitize-resume-markdown-for-ai.js";

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