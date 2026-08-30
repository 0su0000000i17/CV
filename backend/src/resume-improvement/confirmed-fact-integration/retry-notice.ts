import type { ConfirmedFactIntegrationIssue } from "./types.js";

export function createConfirmedFactIntegrationRetryNotice(
  issues: ConfirmedFactIntegrationIssue[]
) {
  const lines = issues.map((issue) =>
    `- sourceIndex ${issue.sourceIndex}${issue.company ? `, ${issue.company}` : ""}: ${issue.reason}. Проблемный bullet: «${issue.bullet}»`
  );
  return `
ОШИБКА СМЫСЛОВОЙ ИНТЕГРАЦИИ ПОДТВЕРЖДЁННЫХ ФАКТОВ:
${lines.join("\n")}

Верни полный JSON заново. Не исправляй такие строки добавлением ещё одного союза или оборота.
Восстанови смысл исходного bullet и вынеси новый подтверждённый факт в отдельный законченный bullet.
Слияние допустимо только если исходный bullet и факт описывают одно действие, а факт уточняет его
метрикой, масштабом, инструментом или прямым результатом. Один bullet — одна причинная цепочка.
`.trim();
}
