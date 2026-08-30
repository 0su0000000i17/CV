'use client';

import { useTheme } from '@/src/shared/providers/theme-provider';
import styles from '../page.module.css';
import { useHomeRays } from './use-home-rays';

export function HomeRays() {
  const { theme } = useTheme();
  const { containerRef, canvasRef } = useHomeRays(theme);

  return (
    <div ref={containerRef} className={styles.homeRays} aria-hidden>
      <canvas ref={canvasRef} />
    </div>
  );
}
