import {
  MessageSquareText,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  WandSparkles,
} from 'lucide-react';

export const VERIFICATION_STEPS = [
  {
    icon: ScanSearch,
    title: 'Проверяем совместимость',
    description: 'Определяем реальный fit, пробелы и риск переадаптации.',
  },
  {
    icon: MessageSquareText,
    title: 'Задаём вопросы',
    description: 'Уточняем метрики, масштаб и недостающий контекст.',
  },
  {
    icon: ShieldCheck,
    title: 'Подтверждаем факты',
    description: 'Берём в работу только ответы, которые подтвердил пользователь.',
  },
  {
    icon: WandSparkles,
    title: 'Адаптируем',
    description: 'Меняем акценты и формулировки без выдуманного опыта.',
  },
  {
    icon: RefreshCw,
    title: 'Повторно проверяем',
    description: 'Сверяем результат с вакансией, исходником и ограничениями.',
  },
] as const;
