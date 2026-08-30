import styles from '../settings.module.css';

import { settingsSections, type SettingsSection } from './settings-sections';

type Props = {
  activeSection: SettingsSection;
  email: string;
  fullName: string;
  initials: string;
  onSelect: (section: SettingsSection) => void;
};

export function SettingsRail({ activeSection, email, fullName, initials, onSelect }: Props) {
  return (
    <aside className={styles.rail} aria-label="Разделы настроек">
      <div className={styles.identity}>
        <span className={styles.avatar} aria-hidden="true">{initials || 'О+'}</span>
        <div>
          <p className={styles.identityName}>{fullName}</p>
          <p className={styles.identityEmail}>{email}</p>
        </div>
      </div>
      <nav className={styles.sectionNav}>
        {settingsSections.map((section) => {
          const Icon = section.icon;
          const isActive = section.id === activeSection;
          return (
            <button
              key={section.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              className={styles.sectionButton}
              data-active={isActive || undefined}
              onClick={() => onSelect(section.id)}
            >
              <span className={styles.sectionIcon}><Icon className="h-4 w-4" strokeWidth={1.8} /></span>
              <span>
                <span className={styles.sectionLabel}>{section.label}</span>
                <span className={styles.sectionDescription}>{section.description}</span>
              </span>
            </button>
          );
        })}
      </nav>
      <p className={styles.railNote}>Данные доступны только в вашем аккаунте.</p>
    </aside>
  );
}
