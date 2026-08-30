import type { ResumeAnalysisSignals } from "../clarifying-questions/types.js";

export function createAnalysisSignalsBlock(signals?: ResumeAnalysisSignals) {
  if (!signals) return "";
  const lines: string[] = [];
  if (signals.weaknesses?.length) lines.push(`Слабые места: ${signals.weaknesses.join("; ")}`);
  if (signals.atsIssues?.length) lines.push(`ATS-проблемы: ${signals.atsIssues.join("; ")}`);
  if (signals.missingKeywords?.length) {
    lines.push(`Недостающие ключевые слова (добавляй только те, что честно подтверждены опытом): ${signals.missingKeywords.join(", ")}`);
  }
  if (signals.recommendations?.length) {
    lines.push(`Рекомендации аудита: ${signals.recommendations.join("; ")}`);
  }
  if (signals.suggestedHeadline) {
    lines.push(`Предложенный аудитом заголовок: ${signals.suggestedHeadline}`);
  }
  if (signals.redFlags?.length) {
    lines.push(
      `Риск-факторы: ${signals.redFlags.map((flag) => `${flag.type} - ${flag.explanation}`).join("; ")}`
    );
  }
  if (!lines.length) return "";
  return `
РЕЗУЛЬТАТЫ ПРОФЕССИОНАЛЬНОГО АУДИТА ЭТОГО РЕЗЮМЕ (это то, за что резюме получило сниженную
оценку — устрани КАЖДОЕ замечание, которое можно устранить честно, без выдумывания фактов):
${lines.map((item) => `- ${item}`).join("\n")}

УЛУЧШЕННОЕ РЕЗЮМЕ БУДЕТ ПОВТОРНО ОЦЕНЕНО ТЕМ ЖЕ АУДИТОМ. Твоя работа считается успешной, только
если повторная оценка вырастет, поэтому:
- Пройди по КАЖДОМУ пункту аудита выше и реши: устраняешь честно или устранить нельзя.
- Каждое устранённое замечание аудита назови в changes конкретно ("закрыто замечание аудита:
  ..."), чтобы было видно, что именно починено.
- Каждое замечание, которое НЕЛЬЗЯ устранить честно (например, не хватает метрик, а кандидат не
  подтвердил цифры в ответах; или пробел в карьере, который текстом не закрыть), назови в
  warnings с причиной — кандидат должен понять, ПОЧЕМУ оценка может не вырасти и что от него
  нужно (какие цифры/факты подтвердить при следующем улучшении), а не гадать.
`.trim();
}
