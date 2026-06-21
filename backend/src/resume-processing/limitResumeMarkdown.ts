type LimitResumeMarkdownResult = {
  markdown: string;
  originalChars: number;
  returnedChars: number;
  maxChars: number;
  limited: boolean;
};

function getMaxChars() {
  const rawValue = Number(process.env.RESUME_EXTRACT_MAX_CHARS);

  if (Number.isFinite(rawValue) && rawValue > 0) {
    return rawValue;
  }

  return 30_000;
}

export function limitResumeMarkdown(markdown: string): LimitResumeMarkdownResult {
  const maxChars = getMaxChars();
  const originalChars = markdown.length;

  if (originalChars <= maxChars) {
    return {
      markdown,
      originalChars,
      returnedChars: originalChars,
      maxChars,
      limited: false,
    };
  }

  const limitedMarkdown = `${markdown.slice(
    0,
    maxChars
  )}\n\n[Content truncated because resume text exceeded the safe analysis limit.]`;

  return {
    markdown: limitedMarkdown,
    originalChars,
    returnedChars: limitedMarkdown.length,
    maxChars,
    limited: true,
  };
}