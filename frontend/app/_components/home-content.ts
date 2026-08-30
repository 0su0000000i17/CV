import type { HomeFeatureArtKind } from './home-feature-art';

export type HomeFeature = {
  art: HomeFeatureArtKind;
  title: string;
  description: string;
  href: string;
};

export const homeFeatures: HomeFeature[] = [
  {
    art: 'analysis',
    title: 'Оценка резюме',
    description:
      'Структура, опыт, доказательность и ATS-совместимость по понятным критериям — с разбором, что именно мешает и как это поправить.',
    href: '/dashboard/analyze',
  },
  {
    art: 'improvement',
    title: 'Улучшение резюме',
    description:
      'Более сильные формулировки, метрики и структура без привязки к конкретной вакансии — универсальная версия для рассылки.',
    href: '/dashboard/improve',
  },
  {
    art: 'adaptation',
    title: 'Адаптация под вакансию',
    description:
      'Отдельная версия под конкретное описание: ключевые слова, стек и акценты вакансии — без выдуманного опыта и лишних навыков.',
    href: '/dashboard/adapt',
  },
  {
    art: 'letter',
    title: 'Сопроводительное письмо',
    description:
      'Письмо под вакансию в выбранном тоне на основе адаптированного резюме — без канцелярита и общих фраз.',
    href: '/dashboard/cover-letter',
  },
];

export const assessmentMetrics = [
  { label: 'Позиционирование', value: '82', tone: 'good' },
  { label: 'Доказательность', value: '54', tone: 'weak' },
  { label: 'ATS', value: '68', tone: 'medium' },
] as const;

export const assessmentToneClass = {
  good: 'bg-white/80',
  medium: 'bg-white/60',
  weak: 'bg-white/40',
} as const;

export type HeroBarMetric = {
  key: string;
  label: string;
  before: number;
  after: number;
};

export const heroBarMetrics: HeroBarMetric[] = [
  { key: 'overall', label: 'Общая оценка', before: 48, after: 88 },
  { key: 'positioning', label: 'Позиционирование', before: 62, after: 84 },
  { key: 'evidence', label: 'Доказательность', before: 41, after: 79 },
  { key: 'ats', label: 'ATS', before: 55, after: 93 },
];
