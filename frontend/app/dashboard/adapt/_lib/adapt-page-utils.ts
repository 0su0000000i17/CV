export type VacancyInputKind = 'empty' | 'url' | 'text';

export function createResumeRoute(
  path: '/dashboard/analyze' | '/dashboard/adapt',
  searchParamsString: string,
  resumeId: string
) {
  const params = new URLSearchParams(searchParamsString);
  params.set('resumeId', resumeId);

  return `${path}?${params.toString()}`;
}

export function getVacancyInputKind(value: string): VacancyInputKind {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return 'empty';
  }

  if (trimmedValue.includes('\n') || /\s/.test(trimmedValue)) {
    return 'text';
  }

  const urlWithProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    const url = new URL(urlWithProtocol);

    if (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.hostname.includes('.')
    ) {
      return 'url';
    }

    return 'text';
  } catch {
    return 'text';
  }
}
