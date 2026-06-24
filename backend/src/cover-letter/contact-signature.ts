import { extractResumeProfileFromText } from "../resume-profile/extract-profile-from-text.js";

export function createCoverLetterContactSignature(resumeText: string) {
  const profile = extractResumeProfileFromText(resumeText).profile;
  const telegram = extractTelegramContact(resumeText);

  const contactLines = [
    telegram ? `Telegram: ${telegram}` : null,
    profile.phone ? `Телефон: ${profile.phone}` : null,
    profile.email ? `Почта: ${profile.email}` : null,
  ].filter(Boolean);

  if (!contactLines.length) {
    return null;
  }

  return `Способы связи:\n${contactLines.join("\n")}`;
}

export function appendContactSignature(
  coverLetter: string,
  signature: string | null
) {
  const cleanCoverLetter = coverLetter.trim();

  if (!signature) {
    return cleanCoverLetter;
  }

  if (/способы\s+связи/i.test(cleanCoverLetter)) {
    return cleanCoverLetter;
  }

  return `${cleanCoverLetter}\n\n${signature}`;
}

function extractTelegramContact(text: string) {
  const tMeMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?t\.me\/([a-z0-9_]{4,32})/i
  );

  if (tMeMatch?.[1]) {
    return `@${tMeMatch[1]}`;
  }

  const labeledMatch = text.match(
    /(?:telegram|телеграм|tg|тг)[^\n@]*(@[a-z0-9_]{4,32})/i
  );

  if (labeledMatch?.[1]) {
    return labeledMatch[1];
  }

  return null;
}