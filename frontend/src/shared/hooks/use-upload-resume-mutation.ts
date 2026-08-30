import { useMutation, useQueryClient } from '@tanstack/react-query';

import { uploadResume } from '@/src/shared/api/resumes';

type UploadResumeVariables = {
  file: File;
  accessToken: string;
};

export function useUploadResumeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, accessToken }: UploadResumeVariables) =>
      uploadResume(file, accessToken),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['resumes'],
      });
    },
  });
}
