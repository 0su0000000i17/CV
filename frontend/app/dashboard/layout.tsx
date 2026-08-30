import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { DashboardLayoutClient } from './_components/dashboard-layout-client';

export const metadata: Metadata = {
  title: 'Личный кабинет',
  description: 'Личный кабинет cvmatch.ru для работы с резюме.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
