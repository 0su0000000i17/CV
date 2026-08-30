import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { getAdminPageAccess } from '@/src/shared/lib/admin-access';
import { AdminShell } from './_components/admin-shell';

export const metadata: Metadata = {
  title: 'Админ-панель',
  description: 'Служебная админ-панель cvmatch.ru.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getAdminPageAccess();

  if (access.status === 'unauthenticated') {
    redirect('/login?next=/admin');
  }

  if (access.status !== 'admin') {
    notFound();
  }

  return <AdminShell>{children}</AdminShell>;
}
