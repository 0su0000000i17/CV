import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type ResumeRedFlag = {
  type: string;
  severity: 'minor' | 'major' | 'critical';
  explanation: string;
};

export type ResumeAnalysisResult = {
  score: number;
  summary: string;

  targetRole: string;
  targetLevel: string;
  recentRoles: string[];

  strengths: string[];
  weaknesses: string[];
  atsIssues: string[];
  recommendations: string[];
  missingKeywords: string[];
  suggestedHeadline: string;

  redFlags: ResumeRedFlag[];

  sections: {
    positioning: number;
    roleFit: number;
    experience: number;
    evidence: number;
    scanability: number;
    ats: number;
    credibility: number;
  };
};

export type ResumeAnalysisRecord = {
  id: string;
  score: number;
  createdAt: string;
  rubricVersion: string;
};

export type AnalyzeResumeMeta = {
  provider: string | null;
  model: string | null;
  markdownChars: number;
  markdownLimited: boolean;
  diagnostics?: {
    heuristicFlags: string[];
    scoring: {
      baseScore: number;
      finalScore: number;
      appliedCaps: string[];
    };
  };
};

export type AnalyzeResumeResponse = {
  resumeId: string;
  analysis: ResumeAnalysisResult;
  analysisRecord: ResumeAnalysisRecord;
  meta: AnalyzeResumeMeta;
};

export type LatestResumeAnalysisResponse = {
  resumeId: string;
  analysis: ResumeAnalysisResult | null;
  analysisRecord: ResumeAnalysisRecord | null;
  meta: AnalyzeResumeMeta | null;
};

export async function analyzeResume(resumeId: string, accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/resumes/${resumeId}/analyze`, {
    method: 'POST',
    headers: {
      ...createAuthHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  return parseApiResponse<AnalyzeResumeResponse>(
    response,
    'Failed to analyze resume'
  );
}

export async function getLatestResumeAnalysis(
  resumeId: string,
  accessToken: string
) {
  const response = await fetch(
    `${getApiUrl()}/api/resumes/${resumeId}/analysis`,
    {
      headers: createAuthHeaders(accessToken),
    }
  );

  return parseApiResponse<LatestResumeAnalysisResponse>(
    response,
    'Failed to fetch latest resume analysis'
  );
}