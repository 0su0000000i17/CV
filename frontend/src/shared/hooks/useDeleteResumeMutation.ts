import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteResume } from "@/src/shared/api/resumes";

type DeleteResumeVariables = {
  resumeId: string;
  accessToken: string;
};

export function useDeleteResumeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resumeId, accessToken }: DeleteResumeVariables) =>
      deleteResume(resumeId, accessToken),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["resumes"],
      });
    },
  });
}