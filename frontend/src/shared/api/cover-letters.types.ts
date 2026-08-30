import type { ResumeAdaptationResult } from './resume-adaptation';

export type CoverLetterTone = 'strict_professional' | 'friendly_neutral' | 'confident_short';
export type GenerateCoverLetterParams = {
  resumeId: string; vacancyText: string; tone: CoverLetterTone; accessToken: string;
  adaptation?: ResumeAdaptationResult; onQueued?: (balance: number) => void;
};
export type CoverLetterResponse = {
  status: 'generated'; resumeId: string; coverLetter: string; warnings: string[];
  meta: { resumeChars: number; vacancyChars: number; markdownChars: number;
    markdownLimited: boolean; contactSignatureAppended: boolean; tone: CoverLetterTone;
    usedAdaptation: boolean; provider: string; model: string };
};
type CoverLetterTaskResponse = {
  status: 'queued' | 'running' | 'failed'; taskId: string; resumeId: string;
  attempts?: number; error?: string | null; createdAt?: string;
  updatedAt?: string; balance?: number;
};
export type CoverLetterApiResponse = CoverLetterResponse | CoverLetterTaskResponse;
