import styles from './dashboard-page-loading.module.css';

type DashboardPageLoadingProps = {
  label?: string;
};

export function DashboardPageLoading({
  label = 'Загружаем личный кабинет...',
}: DashboardPageLoadingProps) {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <div className={styles.mark} aria-hidden="true" />
      <p>{label}</p>
      <div className={styles.track} aria-hidden="true">
        <span />
      </div>
    </div>
  );
}
