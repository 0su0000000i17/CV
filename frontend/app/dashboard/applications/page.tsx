'use client';

import { DashboardPageLoading } from '../_components/dashboard-page-loading';
import { ApplicationMetricCards, VariantMetrics } from './_components/application-metrics-section';
import { ApplicationsHeader } from './_components/applications-header';
import { ApplicationsList } from './_components/applications-list';
import { CreateApplicationForm } from './_components/create-application-form';
import { DeleteApplicationDialog } from './_components/delete-application-dialog';
import { EditApplicationDialog } from './_components/edit-application-dialog';
import { UpcomingInterviews } from './_components/upcoming-interviews';
import { useApplicationsPageController } from './_hooks/use-applications-page-controller';

export default function ApplicationsPage() {
  const state = useApplicationsPageController();

  if (state.loading) {
    return <DashboardPageLoading label="Загружаем отклики..." />;
  }

  return (
    <div className="mx-auto max-w-[1120px] space-y-5 sm:space-y-6">
      <ApplicationsHeader formOpen={state.formOpen} onToggleForm={state.toggleForm} />
      <ApplicationMetricCards metrics={state.metrics} />
      <CreateApplicationForm
        rendered={state.formRendered}
        open={state.formOpen}
        form={state.form}
        resumeOptions={state.resumeOptions}
        vacancyOptions={state.vacancyOptions}
        vacancyLoading={state.suggestionsQuery.isFetching}
        pending={state.createMutation.isPending}
        error={state.createMutation.error}
        onChange={state.updateForm}
        onSubmit={state.handleCreateSubmit}
      />
      <UpcomingInterviews applications={state.upcoming} onEdit={state.openEditor} />
      <VariantMetrics variants={state.metrics.variants} />
      <ApplicationsList
        applications={state.applications}
        filteredCount={state.filtered.length}
        visibleIds={state.visibleIds}
        resumeNames={state.resumeNames}
        upcomingCount={state.upcoming.length}
        filter={state.filter}
        loadingError={state.applicationsQuery.isError}
        enteringId={state.enteringId}
        removingId={state.removingId}
        mutationPending={state.anyListMutationPending}
        onFilter={state.setFilter}
        onStatusChange={state.handleStatusChange}
        onEdit={state.openEditor}
        onDelete={state.setDeleteTarget}
      />
      <EditApplicationDialog
        open={Boolean(state.editTarget)}
        form={state.editForm}
        resumeOptions={state.resumeOptions}
        pending={state.editMutation.isPending}
        error={state.editMutation.error}
        onOpenChange={(open) => {
          if (!open && !state.editMutation.isPending) state.closeEditor();
        }}
        onDelete={() => state.requestDeleteFromEditor(state.editMutation.isPending)}
        onSubmit={state.handleEditSubmit}
        onChange={state.updateEditForm}
      />
      <DeleteApplicationDialog
        target={state.deleteTarget}
        pending={state.deleteMutation.isPending}
        error={state.deleteMutation.error}
        onOpenChange={(open) => {
          if (!open && !state.deleteMutation.isPending) state.setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (state.deleteTarget) state.deleteMutation.mutate(state.deleteTarget.id);
        }}
      />
    </div>
  );
}
