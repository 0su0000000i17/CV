import { extractMarkdownWithMarkitdown } from "./extractors/markitdownExtractor.js";
import { limitResumeMarkdown } from "./limitResumeMarkdown.js";
import { normalizeResumeMarkdown } from "./normalizeResumeMarkdown.js";

type ExtractResumeMarkdownParams = {
  fileBuffer: Buffer;
  fileName?: string | null;
  filePath?: string | null;
  mimeType?: string | null;
};

export async function extractResumeMarkdown(params: ExtractResumeMarkdownParams) {
  const rawMarkdown = await extractMarkdownWithMarkitdown(params);
  const normalizedMarkdown = normalizeResumeMarkdown(rawMarkdown);
  const limitedMarkdown = limitResumeMarkdown(normalizedMarkdown);

  return {
    rawMarkdown,
    normalizedMarkdown,
    markdown: limitedMarkdown.markdown,
    stats: {
      rawChars: rawMarkdown.length,
      normalizedChars: normalizedMarkdown.length,
      returnedChars: limitedMarkdown.returnedChars,
      maxChars: limitedMarkdown.maxChars,
      limited: limitedMarkdown.limited,
    },
  };
}