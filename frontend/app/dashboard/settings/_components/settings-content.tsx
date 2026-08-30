import styles from '../settings.module.css';

import { AccountSettings } from './account-settings';
import { ProfileSettings } from './profile-settings';
import { settingsSections, type SettingsSection } from './settings-sections';

export function SettingsContent({ activeSection }: { activeSection: SettingsSection }) {
  const section = settingsSections.find((item) => item.id === activeSection)!;
  const Icon = section.icon;

  return (
    <section className={styles.content}>
      <header className={styles.contentHeader}>
        <span className={styles.contentIcon} aria-hidden="true">
          <Icon className="h-5 w-5" strokeWidth={1.7} />
        </span>
        <div>
          <h2 className={styles.contentTitle}>{section.label}</h2>
          <p className={styles.contentDescription}>{section.contentDescription}</p>
        </div>
      </header>
      <div key={activeSection} className={styles.sectionStage}>
        {activeSection === 'profile' ? <ProfileSettings view="profile" /> : null}
        {activeSection === 'billing' ? <ProfileSettings view="billing" /> : null}
        {activeSection === 'security' ? <AccountSettings /> : null}
      </div>
    </section>
  );
}
