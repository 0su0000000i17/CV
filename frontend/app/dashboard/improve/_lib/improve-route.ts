export function createImproveRoute(searchParamsString: string, resumeId: string) {
  const params = new URLSearchParams(searchParamsString);
  params.set('resumeId', resumeId);
  return `/dashboard/improve?${params.toString()}`;
}
