export type ResumeVacancyFitLevel =
  | "impossible"
  | "weak"
  | "partial"
  | "solid"
  | "strong";

export type ResumeVacancyCareerMove =
  | "same_role"
  | "adjacent_role"
  | "stretch_role"
  | "career_change"
  | "unknown";

export type ResumeVacancyAdaptationMode = "safe" | "limited" | "blocked";

export type AdaptationSettings = {
  preserveAuthorStyle: boolean;
  strengthenAchievements: boolean;
  optimizeForAts: boolean;
  tailorSkillsToVacancy: boolean;
  makeTextMoreSpecific: boolean;
};

export type ResumeVacancyFitRiskFlag = {
  type:
    | "role_mismatch"
    | "missing_core_experience"
    | "missing_required_skill"
    | "level_mismatch"
    | "domain_mismatch"
    | "weak_evidence"
    | "career_change"
    | "over_adaptation_risk";
  severity: "minor" | "major" | "critical";
  explanation: string;
};

export type ResumeVacancyFitResult = {
  canAdapt: boolean;
  fit: ResumeVacancyFitLevel;
  score: number;
  confidence: number;

  resumeRole: string | null;
  vacancyRole: string | null;
  careerMove: ResumeVacancyCareerMove;
  adaptationMode: ResumeVacancyAdaptationMode;

  reason: string;
  safeAdaptationDirection: string | null;

  matchedRequirements: string[];
  transferableExperience: string[];
  gaps: string[];
  blockingGaps: string[];

  allowedChanges: string[];
  forbiddenChanges: string[];

  riskFlags: ResumeVacancyFitRiskFlag[];
};

export type AdaptedResumeSkills = {
  primary: string[];
  secondary: string[];
  deprioritized: string[];
  notAdded: string[];
};

export type AdaptedResumeExperienceItem = {
  sourceIndex: number;
  company: string | null;
  position: string | null;
  dates: string | null;
  adaptedBullets: string[];
  focus: string | null;
  preservedFacts: string[];
  warnings: string[];
};

export type AdaptedResumeEducation = {
  policy: "unchanged" | "lightly_reordered" | "not_found";
  notes: string[];
};

export type AdaptedResumeDraft = {
  headline: string;
  summary: string;
  skills: AdaptedResumeSkills;
  experience: AdaptedResumeExperienceItem[];
  education: AdaptedResumeEducation;
  additionalInfo: string[];
};

export type ResumeAdaptationTarget = {
  title: string | null;
  company: string | null;
  seniority: string | null;
  keywordsUsed: string[];
};

export type ResumeAdaptationResult = {
  target: ResumeAdaptationTarget;
  adaptedResume: AdaptedResumeDraft;
  changes: string[];
  warnings: string[];
  forbiddenClaims: string[];
};