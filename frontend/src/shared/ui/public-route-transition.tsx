'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import styles from './public-route-transition.module.css';

const footerRoutes = new Set([
  '/offer',
  '/personal-data',
  '/privacy',
  '/terms',
]);

export function PublicRouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (!footerRoutes.has(pathname)) return children;

  return (
    <div key={pathname} className={styles.routeStage}>
      {children}
    </div>
  );
}
