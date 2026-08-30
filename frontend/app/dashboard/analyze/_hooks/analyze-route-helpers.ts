export function createResumeRoute(
  path: '/dashboard/analyze' | '/dashboard/adapt',
  searchParamsString: string,
  resumeId: string,
  options?: {
    autoRun?: boolean;
  }
) {
  const params = new URLSearchParams(searchParamsString);

  params.set('resumeId', resumeId);

  if (options?.autoRun) {
    params.set('autoRun', '1');
  } else {
    params.delete('autoRun');
  }

  return `${path}?${params.toString()}`;
}

export function removeAutoRunFromAnalyzeRoute(
  searchParamsString: string,
  resumeId: string
) {
  const params = new URLSearchParams(searchParamsString);

  params.set('resumeId', resumeId);
  params.delete('autoRun');

  return `/dashboard/analyze?${params.toString()}`;
}
