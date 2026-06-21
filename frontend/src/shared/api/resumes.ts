import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type UploadedResume = {
  id: string;
  user_id: string;
  title: string;
  role: string | null;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  extracted_text: string | null;
  analysis_status: string;
  last_score: number | null;
  created_at: string;
  updated_at: string;
};

type ResumesResponse = {
  resumes: UploadedResume[];
};

type UploadResumeResponse = {
  resume: UploadedResume;
};

type ResumeResponse = {
  resume: UploadedResume;
};

type DeleteResumeResponse = {
  success: boolean;
};

type ResumeDownloadUrlResponse = {
  downloadUrl: string;
};

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

  return parseApiResponse<UploadResumeResponse>(
    response,
    'Failed to upload resume'
  );
}

export async function deleteResume(resumeId: string, accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/resumes/${resumeId}`, {
    method: 'DELETE',
    headers: createAuthHeaders(accessToken),
  });

  return parseApiResponse<DeleteResumeResponse>(
    response,
    'Failed to delete resume'
  );
}

export async function getResumeDownloadUrl(
  resumeId: string,
  accessToken: string
) {
  const response = await fetch(
    `${getApiUrl()}/api/resumes/${resumeId}/download-url`,
    {
      headers: createAuthHeaders(accessToken),
    }
  );

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
