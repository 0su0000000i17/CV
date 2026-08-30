import { Check, FileCheck2, Gauge, ListChecks } from 'lucide-react';

export const improvementFeatures = [
  {
    title: 'Сильные формулировки',
    description: 'Уберём слабые глаголы и усилим смысл без выдуманных фактов.',
    icon: FileCheck2,
  },
  {
    title: 'Измеримые результаты',
    description: 'Подсветим цифры, масштаб задач и влияние вашей работы.',
    icon: Gauge,
  },
  {
    title: 'Навыки и структура',
    description: 'Сделаем опыт понятнее для рекрутера и нанимающего менеджера.',
    icon: ListChecks,
  },
  {
    title: 'Готовность к ATS',
    description: 'Приведём текст к аккуратному формату российского рынка.',
    icon: Check,
  },
] as const;
