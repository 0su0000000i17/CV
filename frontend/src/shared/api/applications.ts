import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type ApplicationStatus =
  | 'planned'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type JobApplication = {
  id: string;
  user_id: string;
  resume_id: string | null;
  resume_variant: string;
  vacancy_title: string;
  company: string | null;
  vacancy_url: string | null;
  status: ApplicationStatus;
  applied_at: string | null;
  interview_at: string | null;
  offer_salary_rub: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ApplicationInput = {
  resumeId?: string | null;
  resumeVariant: string;
  vacancyTitle: string;
  company?: string | null;
  vacancyUrl?: string | null;
  status: ApplicationStatus;
  appliedAt?: string | null;
  interviewAt?: string | null;
  offerSalaryRub?: number | null;
  notes?: string | null;
};

export async function getApplications(accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/applications`, {
    headers: createAuthHeaders(accessToken),
  });
  return parseApiResponse<{ applications: JobApplication[] }>(
    response,
    'Не удалось загрузить отклики'
  );
}

export async function createApplication(input: ApplicationInput, accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/applications`, {
    method: 'POST',
    headers: {
      ...createAuthHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  return parseApiResponse<{ application: JobApplication }>(
    response,
    'Не удалось сохранить отклик'
  );
}

export async function updateApplication(
  applicationId: string,
  input: Partial<ApplicationInput>,
  accessToken: string
) {
  const response = await fetch(`${getApiUrl()}/api/applications/${applicationId}`, {
    method: 'PATCH',
    headers: {
      ...createAuthHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  return parseApiResponse<{ application: JobApplication }>(
    response,
    'Не удалось обновить отклик'
  );
}

export async function deleteApplication(applicationId: string, accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/applications/${applicationId}`, {
    method: 'DELETE',
    headers: createAuthHeaders(accessToken),
  });
  return parseApiResponse<{ success: true }>(
    response,
    'Не удалось удалить отклик'
  );
}
