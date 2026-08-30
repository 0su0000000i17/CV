import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createApplication,
  deleteApplication,
  updateApplication,
  type ApplicationInput,
  type ApplicationStatus,
} from '@/src/shared/api/applications';

export function useApplicationMutations({
  accessToken,
  onCreated,
  onEdited,
  onDeleted,
}: {
  accessToken: string;
  onCreated: (id: string) => void;
  onEdited: () => void;
  onDeleted: (id: string, refresh: () => Promise<unknown>) => void;
}) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['job-applications'] });

  const createMutation = useMutation({
    mutationFn: (input: ApplicationInput) => createApplication(input, accessToken),
    onSuccess: async (data) => {
      onCreated(data.application.id);
      await refresh();
    },
  });
  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      offerSalaryRub,
    }: {
      id: string;
      status: ApplicationStatus;
      offerSalaryRub?: number | null;
    }) =>
      updateApplication(
        id,
        { status, offerSalaryRub: status === 'offer' ? offerSalaryRub : null },
        accessToken
      ),
    onSuccess: refresh,
  });
  const editMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ApplicationInput }) =>
      updateApplication(id, input, accessToken),
    onSuccess: async () => {
      onEdited();
      await refresh();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteApplication(id, accessToken),
    onSuccess: (_data, id) => onDeleted(id, refresh),
  });

  return { createMutation, deleteMutation, editMutation, statusMutation };
}
