'use client';

import { useState } from 'react';

import { useAuth } from '@/src/shared/hooks/use-auth';
import { useProfileQuery } from '@/src/shared/hooks/use-profile-query';

import { DashboardPageLoading } from '../_components/dashboard-page-loading';
import { SettingsContent } from './_components/settings-content';
import { SettingsError } from './_components/settings-error';
import { SettingsHeader } from './_components/settings-header';
import { SettingsRail } from './_components/settings-rail';
import { getProfileInitials, type SettingsSection } from './_components/settings-sections';
import styles from './settings.module.css';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const { accessToken, loading } = useAuth();
  const profileQuery = useProfileQuery(accessToken);
  const profile = profileQuery.data?.profile;

  if (loading || !accessToken || profileQuery.isPending) {
    return <DashboardPageLoading label="Загружаем настройки..." />;
  }
  if (profileQuery.isError || !profile) {
    return <SettingsError onRetry={() => profileQuery.refetch()} />;
  }

  return (
    <div className={`${styles.page} mx-auto max-w-[1120px] pb-8`}>
      <SettingsHeader />
      <div className={styles.workspace}>
        <SettingsRail
          activeSection={activeSection}
          email={profile.email}
          fullName={profile.full_name}
          initials={getProfileInitials(profile.full_name)}
          onSelect={setActiveSection}
        />
        <SettingsContent activeSection={activeSection} />
      </div>
    </div>
  );
}
