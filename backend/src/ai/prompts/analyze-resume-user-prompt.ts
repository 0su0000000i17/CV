import type { AiResumeAnalysis } from "../schemas/resume-analysis-schema.js";

export type PreviousResumeAssessment = {
  score: number;
  analysis: AiResumeAnalysis;
};

function createPreviousAssessmentSection(previous: PreviousResumeAssessment) {
  const analysis = previous.analysis;
  const snapshot = {
    previousScore: previous.score,
    targetRole: analysis.targetRole,
    targetLevel: analysis.targetLevel,
    positioningQuality: analysis.positioningQuality,
    relevantExperience: analysis.relevantExperience,
    evidenceQuality: analysis.evidenceQuality,
    scanability: analysis.scanability,
    atsCompatibility: analysis.atsCompatibility,
    redFlags: analysis.redFlags,
    weaknesses: analysis.weaknesses,
    recommendations: analysis.recommendations,
  };
  return `
КОНТЕКСТ ПОВТОРНОЙ ОЦЕНКИ:
Это оценка новой версии резюме после изменения текста. Ниже — снимок предыдущего анализа
другой версии того же резюме. Используй его только как чек-лист для проверки, устранены ли
ранее найденные проблемы. Сначала оцени текущий текст самостоятельно по общей системе критериев.
Не сохраняй прежние категории по инерции и не повышай их только из-за факта улучшения.
Предыдущий score указан справочно: финальный score всё равно независимо рассчитает backend.

${JSON.stringify(snapshot, null, 2)}
`.trim();
}

export function createAnalyzeResumeUserPrompt(
  resumeMarkdown: string,
  previousAssessment?: PreviousResumeAssessment
) {
  const previousSection = previousAssessment
    ? createPreviousAssessmentSection(previousAssessment)
    : "";
  return `
Проанализируй резюме строго и объективно.

Не ставь финальный score.
Не пиши рекламный пересказ.
Не добавляй позитивные выводы без доказательств.
Ответ должен быть только JSON.

${previousSection ? `${previousSection}\n\n` : ""}РЕЗЮМЕ ТЕКУЩЕЙ ВЕРСИИ:
"""
${resumeMarkdown}
"""
`.trim();
}
