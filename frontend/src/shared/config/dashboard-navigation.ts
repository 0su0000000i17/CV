import {
  BarChart3,
  BriefcaseBusiness,
  CreditCard,
  FileText,
  Home,
  Mail,
  Settings,
  Sparkles,
  Target,
} from 'lucide-react';

export const dashboardNavigationGroups = [
  {
    label: 'Главное',
    items: [
      { title: 'Обзор', href: '/dashboard', icon: Home },
      { title: 'Мои резюме', href: '/dashboard/resumes', icon: FileText },
    ],
  },
  {
    label: 'ИИ-инструменты',
    items: [
      { title: 'Оценить резюме', href: '/dashboard/analyze', icon: BarChart3 },
      { title: 'Улучшить резюме', href: '/dashboard/improve', icon: Sparkles },
      { title: 'Адаптировать', href: '/dashboard/adapt', icon: Target },
      {
        title: 'Сопроводительное',
        href: '/dashboard/cover-letter',
        icon: Mail,
      },
    ],
  },
  {
    label: 'Поиск работы',
    items: [
      {
        title: 'Мои отклики',
        href: '/dashboard/applications',
        icon: BriefcaseBusiness,
      },
    ],
  },
  {
    label: 'Аккаунт',
    items: [
      { title: 'Оплата', href: '/dashboard/billing', icon: CreditCard },
      { title: 'Настройки', href: '/dashboard/settings', icon: Settings },
    ],
  },
] as const;

export function isDashboardRouteActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
}
