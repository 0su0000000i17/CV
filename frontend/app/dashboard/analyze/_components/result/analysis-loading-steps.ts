export type LoadingStep = {
  title: string;
  description: string;
};

const STEP_DURATION_MS = 6_000;
const LONG_WAIT_STEP_DURATION_MS = 12_000;

const analysisSteps: LoadingStep[] = [
  {
    title: 'Считаем позиционирование',
    description:
      'Проверяем, насколько понятно резюме показывает роль, фокус и ценность кандидата.',
  },
  {
    title: 'Проверяем соответствие роли',
    description:
      'Смотрим, подтверждают ли опыт, последние должности и стек заявленную позицию.',
  },
  {
    title: 'Оцениваем релевантный опыт',
    description:
      'Разбираем production-задачи, карьерную линию, стек и глубину опыта.',
  },
  {
    title: 'Проверяем доказательность',
    description:
      'Ищем метрики, результаты, масштаб задач и конкретное влияние на продукт.',
  },
  {
    title: 'Смотрим профиль резюме',
    description:
      'Оцениваем, достаточно ли раскрыт опыт для уровня кандидата и нет ли лишней перегрузки.',
  },
  {
    title: 'Проверяем ATS-фильтры',
    description:
      'Смотрим структуру, ключевые слова и потенциальные проблемы автоматического отбора.',
  },
  {
    title: 'Оцениваем риск-факторы',
    description:
      'Проверяем завышенный уровень, несостыковки, перегруз навыками и слабые места.',
  },
  {
    title: 'Собираем итоговую оценку',
    description:
      'Структурируем вывод, рекомендации и детализацию по профессиональной рубрике.',
  },
];

const longWaitSteps: LoadingStep[] = [
  {
    title: 'Ещё немного',
    description:
      'Финализируем результат и приводим рекомендации к понятному формату.',
  },
  {
    title: 'Проверяем итоговую структуру',
    description:
      'Сверяем сильные стороны, слабые места, ATS-проблемы и риск-факторы.',
  },
  {
    title: 'Почти готово',
    description:
      'Собираем финальный отчёт и подготавливаем результат к отображению.',
  },
];

export function getActiveLoadingStep(elapsedMs: number) {
  const baseDurationMs = analysisSteps.length * STEP_DURATION_MS;

  if (elapsedMs < baseDurationMs) {
    const stepIndex = Math.min(
      analysisSteps.length - 1,
      Math.floor(elapsedMs / STEP_DURATION_MS)
    );

    return analysisSteps[stepIndex];
  }

  const longWaitIndex = Math.min(
    longWaitSteps.length - 1,
    Math.floor((elapsedMs - baseDurationMs) / LONG_WAIT_STEP_DURATION_MS)
  );

  return longWaitSteps[longWaitIndex];
}
