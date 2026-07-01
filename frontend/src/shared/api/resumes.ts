import type { ResumeAdaptationResult } from './resume-adaptation';
import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';
import type {
  ResumeProfileExtractionResponse,
  ResumeTextResponse,
  UploadedResume,
} from './resumes.types';

export type {
  DuplicateResume,
  ResumePersonalProfile,
  ResumeProfileExtractionResponse,
  ResumeTextContacts,
  ResumeTextResponse,
  SourceResumeDocument,
  UploadedResume,
  UploadResumeDuplicateError,
} from './resumes.types';

type ResumesResponse = { resumes: UploadedResume[] };
type UploadResumeResponse = { resume: UploadedResume };
type ResumeResponse = { resume: UploadedResume };
type DeleteResumeResponse = { success: boolean };
type ResumeDownloadUrlResponse = { downloadUrl: string };
type UpdateResumeTextResponse = { status: 'updated'; resume: UploadedResume };

export async function getResumes(accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/resumes`, {
    headers: createAuthHeaders(accessToken),
  });
  return parseApiResponse<ResumesResponse>(response, 'Failed to fetch resumes');
}

export async function uploadResume(file: File, accessToken: string) {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await fetch(`${getApiUrl()}/api/resumes/upload`, {
    method: 'POST',
    headers: createAuthHeaders(accessToken),
    body: formData,
  });
  return parseApiResponse<UploadResumeResponse>(response, 'Failed to upload resume');
}

export async function deleteResume(resumeId: string, accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/resumes/${resumeId}`, {
    method: 'DELETE',
    headers: createAuthHeaders(accessToken),
  });
  return parseApiResponse<DeleteResumeResponse>(response, 'Failed to delete resume');
}

export async function getResumeDownloadUrl(resumeId: string, accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/resumes/${resumeId}/download-url`, {
    headers: createAuthHeaders(accessToken),
  });
  return parseApiResponse<ResumeDownloadUrlResponse>(
    response,
    'Failed to get resume download url'
  );
}

export async function getResumeById(resumeId: string, accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/resumes/${resumeId}`, {
    headers: createAuthHeaders(accessToken),
  });
  return parseApiResponse<ResumeResponse>(response, 'Failed to fetch resume');
}

export async function getResumeText(resumeId: string, accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/resumes/${resumeId}/text`, {
    headers: createAuthHeaders(accessToken),
  });
  return parseApiResponse<ResumeTextResponse>(response, 'Failed to fetch resume text');
}

export async function updateResumeText(params: {
  resumeId: string;
  resumeJson: ResumeAdaptationResult;
  photoUrl?: string | null;
  accessToken: string;
}) {
  const response = await fetch(`${getApiUrl()}/api/resumes/${params.resumeId}/text`, {
    method: 'PATCH',
    headers: {
      ...createAuthHeaders(params.accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resumeJson: params.resumeJson, photoUrl: params.photoUrl }),
  });
  return parseApiResponse<UpdateResumeTextResponse>(
    response,
    'Failed to update resume text'
  );
}

export async function extractResumeProfile(resumeId: string, accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/resumes/${resumeId}/extract-profile`, {
    method: 'POST',
    headers: createAuthHeaders(accessToken),
  });
  return parseApiResponse<ResumeProfileExtractionResponse>(
    response,
    'Failed to extract resume profile'
  );
}
