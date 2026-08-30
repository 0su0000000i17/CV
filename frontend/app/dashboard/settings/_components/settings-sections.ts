import { ShieldCheck, UserRound, WalletCards } from 'lucide-react';

export type SettingsSection = 'profile' | 'billing' | 'security';

export const settingsSections = [
  {
    id: 'profile' as const,
    label: 'Профиль',
    description: 'Имя и email',
    contentDescription: 'Настройте, как к вам обращаться, и какой адрес использовать для входа.',
    icon: UserRound,
  },
  {
    id: 'billing' as const,
    label: 'Баланс и тариф',
    description: 'Кредиты и доступ',
    contentDescription: 'Следите за доступными кредитами и управляйте текущим планом.',
    icon: WalletCards,
  },
  {
    id: 'security' as const,
    label: 'Безопасность',
    description: 'Сессия и данные',
    contentDescription: 'Управляйте текущей сессией и критичными действиями с аккаунтом.',
    icon: ShieldCheck,
  },
];

export function getProfileInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
