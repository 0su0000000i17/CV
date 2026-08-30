import type { FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';

import type { ApplicationStatus, JobApplication } from '@/src/shared/api/applications';
import { useAuth } from '@/src/shared/hooks/use-auth';
import { isApplicationFormValid, toApplicationInput } from '../_lib/application-form';
import { useApplicationMutations } from './use-application-mutations';
import { useApplicationQueries } from './use-application-queries';
import { useApplicationUiState } from './use-application-ui-state';

export function useApplicationsPageController() {
  const searchParams = useSearchParams();
  const { accessToken } = useAuth();
  const ui = useApplicationUiState(searchParams);
  const queries = useApplicationQueries({
    accessToken,
    formRendered: ui.formRendered,
    vacancyTitle: ui.form.vacancyTitle,
    filter: ui.filter,
  });
  const mutations = useApplicationMutations({
    accessToken: accessToken ?? '',
    onCreated: ui.handleCreated,
    onEdited: ui.closeEditor,
    onDeleted: ui.handleDeleted,
  });

  function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isApplicationFormValid(ui.form) || mutations.createMutation.isPending) return;
    mutations.createMutation.mutate(toApplicationInput(ui.form));
  }

  function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ui.editTarget || !isApplicationFormValid(ui.editForm)) return;
    mutations.editMutation.mutate({
      id: ui.editTarget.id,
      input: toApplicationInput(ui.editForm),
    });
  }

  function handleStatusChange(item: JobApplication, status: ApplicationStatus) {
    if (status === 'interview' && !item.interview_at) {
      ui.openEditor(item, status);
      return;
    }
    if (status === 'offer' && !item.offer_salary_rub) {
      ui.openEditor(item, status);
      return;
    }
    mutations.statusMutation.mutate({
      id: item.id,
      status,
      offerSalaryRub: status === 'offer' ? item.offer_salary_rub : undefined,
    });
  }

  const loading =
    !accessToken || queries.applicationsQuery.isPending || queries.resumesQuery.isPending;
  const anyListMutationPending =
    mutations.statusMutation.isPending || mutations.deleteMutation.isPending;

  return {
    ...mutations,
    ...queries,
    ...ui,
    anyListMutationPending,
    handleCreateSubmit,
    handleEditSubmit,
    handleStatusChange,
    loading,
  };
}
