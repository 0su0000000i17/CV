import type { LoadingStep } from '@/src/shared/ui/staged-loading-state';

export const questionsLoadingSteps: LoadingStep[] = [
  {
    title: 'Ищем слабые места резюме',
    description: 'Смотрим, где не хватает метрик, масштаба или конкретных инструментов.',
  },
  {
    title: 'Составляем уточняющие вопросы',
    description: 'Формулируем вопросы, ответы на которые реально усилят резюме.',
  },
];

export const questionsLongWaitSteps: LoadingStep[] = [
  {
    title: 'Почти готово',
    description: 'Собираем вопросы в один список.',
  },
];
