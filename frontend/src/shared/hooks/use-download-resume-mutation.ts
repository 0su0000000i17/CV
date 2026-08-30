import { useMutation } from '@tanstack/react-query';

import { createAuthHeaders, getApiUrl } from '@/src/shared/api/http';
import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import { getResumeDownloadUrl, type UploadedResume } from '@/src/shared/api/resumes';
import { createResumePdfFileName } from '@/src/shared/lib/resume-file-name';

type DownloadResumeVariables = {
  resume: UploadedResume;
  accessToken: string;
};

const emptyContacts = {
  fullName: '',
  gender: '',
  age: '',
  birthDate: '',
  phone: '',
  email: '',
  city: '',
  citizenship: '',
  workPermit: '',
  relocation: '',
  businessTrips: '',
};

function createEmptyAdaptation(resume: UploadedResume): ResumeAdaptationResult {
  return {
    target: {
      title: resume.role || resume.title || null,
      company: null,
      seniority: null,
      salary: null,
      specializations: [],
      employment: null,
      schedule: null,
      workFormat: null,
      commuteTime: null,
      keywordsUsed: [],
    },
    adaptedResume: {
      headline: resume.role || resume.title || '',
      summary: '',
      skills: { primary: [], secondary: [], deprioritized: [], notAdded: [] },
      experience: [],
      education: { policy: 'unchanged', notes: [] },
      additionalInfo: [],
    },
    changes: [],
    warnings: [],
    forbiddenClaims: [],
    metricGaps: [],
  };
}

function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}

async function downloadOriginalResume(resume: UploadedResume, accessToken: string) {
  const { downloadUrl } = await getResumeDownloadUrl(resume.id, accessToken);
  const response = await fetch(downloadUrl);

  if (!response.ok) {
    throw new Error('Failed to download original resume file');
  }

  downloadBlob(
    await response.blob(),
    createResumePdfFileName(resume.title, resume.file_name)
  );
}

async function downloadGeneratedResume(resume: UploadedResume, accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/resumes/${resume.id}/export/classic`, {
    method: 'POST',
    headers: {
      ...createAuthHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sourceTitle: resume.file_name || resume.title || 'resume',
      vacancyText: '',
      photoUrl: null,
      contacts: emptyContacts,
      adaptation: resume.editable_resume_json ?? createEmptyAdaptation(resume),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to download resume PDF');
  }

  downloadBlob(
    await response.blob(),
    createResumePdfFileName(resume.title, resume.file_name)
  );
}

export function useDownloadResumeMutation() {
  return useMutation({
    mutationFn: async ({ resume, accessToken }: DownloadResumeVariables) => {
      try {
        await downloadOriginalResume(resume, accessToken);
      } catch {
        await downloadGeneratedResume(resume, accessToken);
      }
    },
  });
}
