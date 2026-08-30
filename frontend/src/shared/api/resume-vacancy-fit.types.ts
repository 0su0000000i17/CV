type ResumeVacancyFitLevel = 'impossible' | 'weak' | 'partial' | 'solid' | 'strong';
type ResumeVacancyCareerMove =
  | 'same_role' | 'adjacent_role' | 'stretch_role' | 'career_change' | 'unknown';
type ResumeVacancyAdaptationMode = 'safe' | 'limited' | 'blocked';
export type ResumeVacancyFitRiskFlag = {
  type: 'role_mismatch' | 'missing_core_experience' | 'missing_required_skill' |
    'level_mismatch' | 'domain_mismatch' | 'weak_evidence' | 'career_change' |
    'over_adaptation_risk';
  severity: 'minor' | 'major' | 'critical'; explanation: string;
};
export type ResumeVacancyFitResult = {
  canAdapt: boolean; fit: ResumeVacancyFitLevel; score: number; confidence: number;
  resumeRole: string | null; vacancyRole: string | null;
  careerMove: ResumeVacancyCareerMove; adaptationMode: ResumeVacancyAdaptationMode;
  reason: string; safeAdaptationDirection: string | null;
  matchedRequirements: string[]; transferableExperience: string[]; gaps: string[];
  blockingGaps: string[]; allowedChanges: string[]; forbiddenChanges: string[];
  riskFlags: ResumeVacancyFitRiskFlag[];
};
export type ResumeVacancyFitResponse = {
  status: 'fit_passed' | 'fit_blocked'; resumeId: string; fit: ResumeVacancyFitResult;
  meta: { resumeChars: number; vacancyChars: number; markdownChars: number;
    markdownLimited: boolean; provider: string; model: string };
};
type ResumeVacancyFitTaskResponse = {
  status: 'queued' | 'running' | 'failed'; taskId: string; resumeId: string;
  attempts?: number; error?: string | null; createdAt?: string;
  updatedAt?: string; balance?: number;
};
export type ResumeVacancyFitApiResponse = ResumeVacancyFitResponse | ResumeVacancyFitTaskResponse;
