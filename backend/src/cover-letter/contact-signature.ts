import { parseSourceResumeDocument } from "../resume-document/parser/parse-source-resume-document.js";
import { buildProfileFromSourceResumeDocument } from "../resume-document/profile-compat.js";

export function createCoverLetterContactSignature(resumeText: string) {
  const document = parseSourceResumeDocument(resumeText);
  const profile = buildProfileFromSourceResumeDocument(document);
  const telegram = document.personal.telegram || document.additional.telegram;

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