import type { ApplicationStatus, JobApplication } from '@/src/shared/api/applications';
import type { TrackerFilter } from '../_lib/application-presentation';
import { filterOptions } from '../_lib/application-presentation';
import styles from '../applications.module.css';
import { ApplicationListItem } from './application-list-item';
import { ApplicationsEmptyState } from './application-ui';

type Props = {
  applications: JobApplication[];
  filteredCount: number;
  visibleIds: Set<string>;
  resumeNames: Map<string, string>;
  upcomingCount: number;
  filter: TrackerFilter;
  loadingError: boolean;
  enteringId: string | null;
  removingId: string | null;
  mutationPending: boolean;
  onFilter: (filter: TrackerFilter) => void;
  onStatusChange: (item: JobApplication, status: ApplicationStatus) => void;
  onEdit: (item: JobApplication) => void;
  onDelete: (item: JobApplication) => void;
};

export function ApplicationsList(props: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-foreground/10 bg-foreground/[0.018]">
      <div className="border-b border-foreground/10 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-medium text-foreground">Все записи</h2>
            <p className="mt-1 text-xs text-foreground/40">
              {props.applications.length} всего · {props.upcomingCount} запланировано
            </p>
          </div>
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-foreground/10 bg-foreground/[0.025] p-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => props.onFilter(option.value)}
                aria-pressed={props.filter === option.value}
                className={`shrink-0 cursor-pointer rounded-md px-3 py-2 text-xs ${
                  props.filter === option.value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-foreground/45 hover:text-foreground/75'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {props.loadingError ? (
        <p className="p-6 text-sm text-red-500">Не удалось загрузить отклики.</p>
      ) : props.applications.length ? (
        <div className={styles.filterList}>
          {props.applications.map((application) => (
            <ApplicationListItem
              key={application.id}
              application={application}
              visible={props.visibleIds.has(application.id)}
              resumeName={application.resume_id ? props.resumeNames.get(application.resume_id) : null}
              entering={application.id === props.enteringId}
              removing={application.id === props.removingId}
              mutationPending={props.mutationPending}
              onStatusChange={(status) => props.onStatusChange(application, status)}
              onEdit={() => props.onEdit(application)}
              onDelete={() => props.onDelete(application)}
            />
          ))}
          {!props.filteredCount ? (
            <div key={props.filter} className={styles.filterEmptyEnter}>
              <ApplicationsEmptyState hasApplications />
            </div>
          ) : null}
        </div>
      ) : (
        <ApplicationsEmptyState hasApplications={false} />
      )}
    </section>
  );
}
