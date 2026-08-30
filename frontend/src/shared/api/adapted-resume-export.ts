import type { ResumeAdaptationResult } from './resume-adaptation';
import { createAuthHeaders, getApiUrl } from './http';

export type AdaptedResumeExportContacts = {
  fullName: string;
  gender: string;
  age: string;
  birthDate: string;
  phone: string;
  email: string;
  city: string;
  citizenship: string;
  workPermit: string;
  relocation: string;
  businessTrips: string;
};

export type AdaptedResumeExportPayload = {
  sourceTitle: string;
  vacancyText: string;
  photoUrl: string | null;
  contacts: AdaptedResumeExportContacts;
  adaptation: ResumeAdaptationResult;
};

async function readError(response: Response) {
  const text = await response.text();

  if (!text) {
    return 'Failed to save adapted resume';
  }

  try {
    const data = JSON.parse(text) as { message?: string };
    return data.message || text;
  } catch {
    return text;
  }
}

export async function exportAdaptedResumePdf(params: {
  resumeId: string;
  accessToken: string;
  payload: AdaptedResumeExportPayload;
}) {
  const response = await fetch(
    `${getApiUrl()}/api/resumes/${params.resumeId}/export/classic`,
    {
      method: 'POST',
      headers: {
        ...createAuthHeaders(params.accessToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params.payload),
    }
  );

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.blob();
}