import type { ResumeAnalysisResult } from '@/src/shared/api/analyze';

export type SectionRow = {
  key: string;
  title: string;
  score: number;
  status: string;
  description: string;
};

function getStatusLabel(params: {
  hasAnalysis: boolean;
  isAnalyzing: boolean;
}) {
  if (params.isAnalyzing) {
    return 'Идёт проверка';
  }

  return params.hasAnalysis ? 'Проверено' : 'Ожидает проверки';
}

export function getSectionRows(
  analysis: ResumeAnalysisResult | undefined,
  isAnalyzing: boolean
): SectionRow[] {
  const hasAnalysis = Boolean(analysis);
  const status = getStatusLabel({ hasAnalysis, isAnalyzing });

  return [
    {
      key: 'positioning',
      title: 'Позиционирование',
      score: analysis?.sections.positioning ?? 0,
      status,
      description:
        'Насколько понятно резюме показывает кандидата под конкретную роль: кто он, на какую позицию претендует и не размыт ли фокус.',
    },
    {
      key: 'roleFit',
      title: 'Соответствие роли',
      score: analysis?.sections.roleFit ?? 0,
      status,
      description:
        'Показывает, подтверждают ли последние должности, задачи и опыт заявленную роль и уровень.',
    },
    {
      key: 'experience',
      title: 'Релевантный опыт',
      score: analysis?.sections.experience ?? 0,
      status,
      description:
        'Оценивает, насколько опыт кандидата связан с целевой позицией: production-задачи, подходящий стек, карьерная линия и глубина опыта.',
    },
    {
      key: 'evidence',
      title: 'Доказательность',
      score: analysis?.sections.evidence ?? 0,
      status,
      description:
        'Показывает, насколько резюме доказывает ценность кандидата: результаты, метрики, масштаб задач и влияние на продукт.',
    },
    {
      key: 'scanability',
      title: 'Профиль резюме',
      score: analysis?.sections.scanability ?? 0,
      status,
      description:
        'Показывает, достаточно ли понятно раскрыт опыт: не слишком кратко и не слишком длинно, с нужными деталями по задачам, стеку и результатам.',
    },
    {
      key: 'ats',
      title: 'ATS',
      score: analysis?.sections.ats ?? 0,
      status,
      description:
        'Оценивает пригодность резюме для автоматического отбора: стандартные секции, понятные должности, ключевые слова и парсинг.',
    },
    {
      key: 'credibility',
      title: 'Риск-факторы',
      score: analysis?.sections.credibility ?? 0,
      status,
      description:
        'Показывает, нет ли завышенного уровня, несостыковки должностей, перегруза навыками или слабой доказательности.',
    },
  ];
}
