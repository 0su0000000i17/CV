export type ResumeRedFlag = {
  type: string; severity: 'minor' | 'major' | 'critical'; explanation: string;
};
export type ResumeAnalysisResult = {
  score: number; summary: string; targetRole: string; targetLevel: string;
  recentRoles: string[]; strengths: string[]; weaknesses: string[];
  atsIssues: string[]; recommendations: string[]; missingKeywords: string[];
  suggestedHeadline: string; redFlags: ResumeRedFlag[];
  sections: { positioning: number; roleFit: number; experience: number;
    evidence: number; scanability: number; ats: number; credibility: number };
};
type ResumeAnalysisRecord = {
  id: string; score: number; createdAt: string; rubricVersion: string;
};
type AnalyzeResumeMeta = {
  provider: string | null; model: string | null; markdownChars: number;
  markdownLimited: boolean;
  diagnostics?: { heuristicFlags: string[]; scoring: { baseScore: number;
    finalScore: number; appliedCaps: string[] }; comparison?: { previousScore: number } | null };
};
export type AnalyzeResumeResponse = {
  resumeId: string; analysis: ResumeAnalysisResult;
  analysisRecord: ResumeAnalysisRecord; meta: AnalyzeResumeMeta;
};
export type LatestResumeAnalysisResponse = {
  resumeId: string; analysis: ResumeAnalysisResult | null;
  analysisRecord: ResumeAnalysisRecord | null; meta: AnalyzeResumeMeta | null;
  stale?: boolean;
};
type AnalyzeResumeTaskResponse = {
  status: 'queued' | 'running' | 'failed'; taskId: string; resumeId: string;
  attempts?: number; error?: string | null; createdAt?: string;
  updatedAt?: string; balance?: number;
};
export type AnalyzeResumeApiResponse = AnalyzeResumeResponse | AnalyzeResumeTaskResponse;
