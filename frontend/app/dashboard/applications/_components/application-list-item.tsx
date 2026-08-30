import type { ApplicationStatus, JobApplication } from '@/src/shared/api/applications';
import styles from '../applications.module.css';
import { ApplicationRowActions } from './application-row-actions';
import { ApplicationRowDetails } from './application-row-details';

type Props = {
  application: JobApplication;
  visible: boolean;
  resumeName?: string | null;
  entering: boolean;
  removing: boolean;
  mutationPending: boolean;
  onStatusChange: (status: ApplicationStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function ApplicationListItem({
  application,
  visible,
  resumeName,
  entering,
  removing,
  mutationPending,
  onStatusChange,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div data-visible={visible} aria-hidden={!visible} className={styles.filterItem}>
      <div className={styles.filterItemInner}>
        <article
          className={`${styles.applicationRow} grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center ${
            entering ? styles.applicationEnter : ''
          } ${removing ? styles.applicationExit : ''}`}
        >
          <ApplicationRowDetails application={application} resumeName={resumeName} />
          <ApplicationRowActions
            application={application}
            disabled={mutationPending || !visible}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </article>
      </div>
    </div>
  );
}
