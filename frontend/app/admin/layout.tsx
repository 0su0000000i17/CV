import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Админ-панель',
  description: 'Служебная админ-панель CVPro.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
