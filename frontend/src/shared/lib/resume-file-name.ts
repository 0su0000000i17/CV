function cleanFileNamePart(value: string | null | undefined) {
  return String(value || '')
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripResumePdfSuffixes(value: string) {
  let result = value.trim();

  result = result.replace(/\.pdf$/i, '').trim();

  return result;
}

export function createResumePdfFileName(...candidates: Array<string | null | undefined>) {
  const baseName =
    candidates
      .map(cleanFileNamePart)
      .map(stripResumePdfSuffixes)
      .find(Boolean) || 'resume';

  return `${baseName}.pdf`;
}
