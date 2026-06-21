import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateProfile } from '@/src/shared/api/profile';

type UpdateProfileVariables = {
  fullName: string;
  accessToken: string;
};

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fullName, accessToken }: UpdateProfileVariables) =>
      updateProfile(fullName, accessToken),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
    },
  });
}
