'use client';

import { useTheme } from '@/src/shared/providers/theme-provider';
import styles from './theme-toggle.module.css';

export function ThemeToggle() {
  const { mounted, theme, toggleTheme } = useTheme();
  const isLight = mounted && theme === 'light';

  return (
    <button
      type="button"
      className={styles.toggle}
      data-theme-control
      data-light={isLight || undefined}
      onClick={toggleTheme}
      disabled={!mounted}
      aria-label={isLight ? 'Включить тёмную тему' : 'Включить светлую тему'}
      aria-pressed={isLight}
    >
      <span className={styles.track} aria-hidden="true">
        <span className={styles.orbit} />
        <span className={styles.starOne} />
        <span className={styles.starTwo} />
        <span className={styles.core}>
          <span className={styles.eclipse} />
        </span>
      </span>
    </button>
  );
}
