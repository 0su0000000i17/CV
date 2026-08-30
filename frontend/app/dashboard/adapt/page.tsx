'use client';

import { AdaptHeader } from './_components/adapt-header';
import { AdaptPageContent } from './_components/adapt-page-content';
import { useAdaptPageActions } from './_hooks/use-adapt-page-actions';
import { useAdaptPageEffects } from './_hooks/use-adapt-page-effects';
import { useAdaptPageModel } from './_hooks/use-adapt-page-model';
import styles from './adapt.module.css';
import { DashboardPageLoading } from '../_components/dashboard-page-loading';

export default function AdaptPage() {
  const model = useAdaptPageModel();
  const effects = useAdaptPageEffects(model);
  const actions = useAdaptPageActions(model);
  if (!model.accessToken || model.resumesQuery.isPending) {
    return <DashboardPageLoading label="Готовим адаптацию..." />;
  }
  return (
    <div className={`${styles.page} mx-auto max-w-[1120px]`}>
      <AdaptHeader />
      <div className={styles.state}>
        <AdaptPageContent model={model} actions={actions}
          currentProfile={effects.currentProfile}
          isProfileLoading={effects.isProfileLoading} />
      </div>
    </div>
  );
}
