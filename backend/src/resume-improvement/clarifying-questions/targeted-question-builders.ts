import type { EvidenceOpportunity } from "./question-opportunities.js";
import { normalizeQuestionText } from "./question-topic.js";
import type { ResumeQuestionContext } from "./resume-question-context.js";
import type { ClarifyingQuestion, ResumeAnalysisSignals } from "./types.js";

const POSITIONING_SIGNAL = /(?:unclear_positioning|inconsistent_titles|позиционир|карьерн.{0,20}цел|заголов)/iu;
const GENERIC_TITLE = /^(?:специалист|менеджер|разработчик|руководитель|сотрудник)$/iu;
const AMBIGUOUS_TITLE = /(?:[/,;]|\s+и\s+|\bor\b)/iu;

function experienceName(opportunity: EvidenceOpportunity) {
  return [opportunity.company, opportunity.position].filter(Boolean).join(" — ")
    || `место работы №${opportunity.sourceIndex + 1}`;
}

function compactClaim(claim: string) {
  return claim.length <= 220 ? claim : `${claim.slice(0, 217).trim()}…`;
}

export function buildEvidenceQuestion(
  opportunity: EvidenceOpportunity,
  index: number,
): ClarifyingQuestion {
  const context = experienceName(opportunity);
  const question = opportunity.claim
    ? `В опыте «${context}» есть пункт: «${compactClaim(opportunity.claim)}». Какой конкретный факт можно честно добавить, чтобы показать результат этой работы?`
    : `В опыте «${context}» не описаны результаты работы. Какой конкретный результат вы можете честно подтвердить?`;
  return {
    id: `evidence-${opportunity.sourceIndex}-${opportunity.claimIndex}-${index + 1}`,
    question,
    targetArea: opportunity.topic === "metrics" ? "metrics" : "impact",
    sourceIndex: opportunity.sourceIndex,
    kind: "experience",
    purpose: "evidence",
    topic: opportunity.topic,
    options: [
      { key: "metric", label: "Добавлю измеримый результат: показатель, значение и период", custom: true },
      { key: "scope", label: "Добавлю масштаб: объём, аудиторию, нагрузку, команду или число задач", custom: true },
      { key: "outcome", label: "Добавлю важный результат без цифры: что именно стало лучше и для кого", custom: true },
      { key: "no", label: "Нет, к этому пункту нечего добавить" },
    ],
  };
}

function positioningSignals(signals?: ResumeAnalysisSignals) {
  return [
    ...(signals?.weaknesses || []), ...(signals?.recommendations || []),
    ...(signals?.redFlags || []).flatMap((flag) => [flag.type, flag.explanation]),
  ].join(" ");
}

function roleCandidates(context: ResumeQuestionContext) {
  const targetParts = context.targetTitle?.split(/[/,;]|\s+и\s+/iu) || [];
  const roles = [...targetParts, ...context.experiences.map((item) => item.position || "")];
  const seen = new Set<string>();
  return roles.map((role) => role.replace(/\s+/gu, " ").trim()).filter((role) => {
    const key = normalizeQuestionText(role);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 3);
}

export function buildPositioningQuestion(
  context: ResumeQuestionContext,
  signals?: ResumeAnalysisSignals,
): ClarifyingQuestion | null {
  const title = context.targetTitle || "";
  const roles = roleCandidates(context);
  const needsQuestion = !title || GENERIC_TITLE.test(title) || AMBIGUOUS_TITLE.test(title)
    || (roles.length > 1 && POSITIONING_SIGNAL.test(positioningSignals(signals)));
  if (!needsQuestion || !roles.length) return null;
  return {
    id: "positioning-primary-role",
    question: "Какую одну роль сделать основной целью этого резюме?",
    targetArea: "positioning",
    kind: "profile",
    purpose: "positioning",
    topic: "positioning",
    options: [
      ...roles.map((role, index) => ({ key: `role_${index + 1}`, label: role })),
      { key: "custom", label: "Другая роль — укажу точное название", custom: true },
      { key: "no", label: "Нет, пока не хочу фиксировать одну целевую роль" },
    ],
  };
}
