type AdaptedResumeSkills = {
  primary: string[]; secondary: string[]; deprioritized: string[]; notAdded: string[];
};
export type AdaptedResumeExperienceItem = {
  sourceIndex: number; company: string | null; companyCity?: string | null;
  companyUrl?: string | null; companyIndustries?: string[]; position: string | null;
  dates: string | null; description?: string | null; adaptedBullets: string[];
  focus: string | null; preservedFacts: string[]; warnings: string[];
};
type ResumeAdaptationTarget = {
  title: string | null; company: string | null; seniority: string | null;
  salary: string | null; specializations: string[]; employment: string | null;
  schedule: string | null; workFormat: string | null; commuteTime: string | null;
  keywordsUsed: string[];
};
export type ResumeAdaptationResult = {
  target: ResumeAdaptationTarget;
  adaptedResume: { headline: string; summary: string; skills: AdaptedResumeSkills;
    experience: AdaptedResumeExperienceItem[];
    education: { policy: 'unchanged' | 'lightly_reordered' | 'not_found'; notes: string[] };
    additionalInfo: string[] };
  changes: string[]; warnings: string[]; forbiddenClaims: string[]; metricGaps: string[];
};
export type AdaptationFitSnapshot = { score: number; fit: string; gaps: string[] };
export type ResumeAdaptationResponse = {
  status: 'adapted'; resumeId: string; adaptation: ResumeAdaptationResult;
  meta: { resumeChars: number; vacancyChars: number; markdownChars: number;
    markdownLimited: boolean; provider: string; model: string; cacheHit?: boolean;
    cacheKey?: string | null; fitBefore?: AdaptationFitSnapshot | null;
    fitAfter?: AdaptationFitSnapshot | null };
};
type ResumeAdaptationTaskResponse = {
  status: 'queued' | 'running' | 'failed'; taskId: string; resumeId: string;
  attempts?: number; error?: string | null; createdAt?: string;
  updatedAt?: string; balance?: number;
};
export type ResumeAdaptationApiResponse = ResumeAdaptationResponse | ResumeAdaptationTaskResponse;
