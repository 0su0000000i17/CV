import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Вход',
  description: 'Вход в личный кабинет CVPro.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
