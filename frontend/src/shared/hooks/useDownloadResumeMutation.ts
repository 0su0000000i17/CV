import { useMutation } from '@tanstack/react-query';

import { getResumeDownloadUrl } from '@/src/shared/api/resumes';

type DownloadResumeVariables = {
  resumeId: string;
  accessToken: string;
  fileName: string;
};

async function downloadFile(downloadUrl: string, fileName: string) {
  const response = await fetch(downloadUrl);

  if (!response.ok) {
    throw new Error('Failed to download file');
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export function useDownloadResumeMutation() {
  return useMutation({
    mutationFn: async ({
      resumeId,
      accessToken,
      fileName,
    }: DownloadResumeVariables) => {
      const { downloadUrl } = await getResumeDownloadUrl(resumeId, accessToken);

      await downloadFile(downloadUrl, fileName);
    },
  });
}
