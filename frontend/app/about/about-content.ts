import { BrainCircuit, FileSearch2, ShieldCheck, type LucideIcon } from 'lucide-react';

export type AboutPrinciple = { icon: LucideIcon; title: string; description: string };

export const aboutPrinciples: AboutPrinciple[] = [
  {
    icon: FileSearch2,
    title: 'Понятный разбор',
    description: 'Показываем не только итоговый балл, но и конкретные места, которые мешают резюме проходить первичный отбор.',
  },
  {
    icon: BrainCircuit,
    title: 'Карьерная редакция',
    description: 'Усиливаем позиционирование, достижения и структуру как профессиональный карьерный консультант.',
  },
  {
    icon: ShieldCheck,
    title: 'Только подтверждённые факты',
    description: 'Сохраняем реальный опыт кандидата и не добавляем навыки, цифры или достижения без подтверждения.',
  },
];

export const aboutOutcomes = [
  'Оценка структуры, позиционирования и ATS-совместимости',
  'Пересборка опыта и раздела «О себе» без эффекта дописанного текста',
  'Отдельная адаптация под требования конкретной вакансии',
  'Сопроводительное письмо на основе подтверждённого опыта',
];
