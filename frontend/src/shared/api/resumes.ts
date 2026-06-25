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
  source_file_hash: string | null;
  extracted_text: string | null;
  analysis_status: string;
  last_score: number | null;
  created_at: string;
  updated_at: string;
};

export type ResumePersonalProfile = {
  fullName: string | null;
  gender: string | null;
  age: string | null;
  birthDate: string | null;
  phone: string | null;
  email: string | null;
  preferredContactMethod: string | null;
  city: string | null;
  citizenship: string | null;
  workPermit: string | null;
  relocation: string | null;
  businessTrips: string | null;
  targetTitle: string | null;
  salary: string | null;
  specializations: string[];
  employment: string | null;
  workFormat: string | null;
  travelTime: string | null;
};

export type ResumeProfileExtractionResponse = {
  status: 'completed';
  resumeId: string;
  source: 'hh_pdf' | 'generic_resume';
  profile: ResumePersonalProfile;
  photo: {
    contentType: string;
    dataUrl: string;
  } | null;
  stats: {
    rawChars: number;
    normalizedChars: number;
    photoFound: boolean;
  };
};

export type ResumeTextResponse = {
  status: 'ok';
  resumeId: string;
  source: 'saved_edit' | 'original_file';
  markdown: string;
  stats: unknown | null;
};

export type DuplicateResume = {
  id: string;
  title: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: string;
};

export type UploadResumeDuplicateError = {
  message: string;
  code: 'DUPLICATE_RESUME';
  duplicateResume?: DuplicateResume;
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

type UpdateResumeTextResponse = {
  status: 'updated';
  resume: UploadedResume;
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

export async function getResumeText(resumeId: string, accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/resumes/${resumeId}/text`, {
    headers: createAuthHeaders(accessToken),
  });

  return parseApiResponse<ResumeTextResponse>(
    response,
    'Failed to fetch resume text'
  );
}

export async function updateResumeText(params: {
  resumeId: string;
  markdown: string;
  accessToken: string;
}) {
  const response = await fetch(
    `${getApiUrl()}/api/resumes/${params.resumeId}/text`,
    {
      method: 'PATCH',
      headers: {
        ...createAuthHeaders(params.accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        markdown: params.markdown,
      }),
    }
  );

  return parseApiResponse<UpdateResumeTextResponse>(
    response,
    'Failed to update resume text'
  );
}

export async function extractResumeProfile(
  resumeId: string,
  accessToken: string
) {
  const response = await fetch(
    `${getApiUrl()}/api/resumes/${resumeId}/extract-profile`,
    {
      method: 'POST',
      headers: createAuthHeaders(accessToken),
    }
  );

  return parseApiResponse<ResumeProfileExtractionResponse>(
    response,
    'Failed to extract resume profile'
  );
}