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
const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl() {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  return API_URL;
}

export async function getResumes(accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/resumes`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch resumes");
  }

  return data as ResumesResponse;
}

export async function uploadResume(file: File, accessToken: string) {
  const formData = new FormData();

  formData.append("resume", file);

  const response = await fetch(`${getApiUrl()}/api/resumes/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to upload resume");
  }

  return data as UploadResumeResponse;
}

export async function deleteResume(resumeId: string, accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/resumes/${resumeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete resume");
  }

  return data as { success: boolean };
}

export async function getResumeDownloadUrl(
  resumeId: string,
  accessToken: string
) {
  const response = await fetch(
    `${getApiUrl()}/api/resumes/${resumeId}/download-url`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get resume download url");
  }

  return data as { downloadUrl: string };
}


export async function getResumeById(resumeId: string, accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/resumes/${resumeId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch resume");
  }

  return data as ResumeResponse;
}
