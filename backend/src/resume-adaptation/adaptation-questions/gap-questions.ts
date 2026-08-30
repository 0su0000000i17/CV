import type { ClarifyingQuestion } from "../../resume-improvement/clarifying-questions/types.js";
import { readResumeQuestionContext } from "../../resume-improvement/clarifying-questions/resume-question-context.js";
import type { NormalizedVacancy, VacancyCriterion } from "../../vacancy-ai/types.js";
import type { ResumeVacancyFitResult } from "../types.js";
import { rankUncoveredCriteria } from "./criterion-ranking.js";

type Option = ClarifyingQuestion["options"][number];

function questionText(criterion: VacancyCriterion) {
  if (criterion.evidence === "credential") {
    return `В вакансии указано «${criterion.text}». Что вы можете подтвердить документом?`;
  }
  if (criterion.evidence === "knowledge") {
    return `В вакансии требуется «${criterion.text}», а в резюме уровень не указан. Что вы можете честно подтвердить?`;
  }
  return `В вакансии требуется «${criterion.text}», но в резюме этого опыта нет. Где и для какой задачи вы применяли это на практике?`;
}

function credentialOptions(): Option[] {
  return [
    { key: "confirmed", label: "Требование выполнено и подтверждается документом", confirmsRequirement: true },
    { key: "in_progress", label: "Сейчас получаю нужное образование или документ", confirmsRequirement: false },
    { key: "custom", label: "Есть другой подтверждающий документ — опишу", custom: true, confirmsRequirement: true },
    { key: "no", label: "Нет, такого образования или документа нет", confirmsRequirement: false },
  ];
}

function knowledgeOptions(): Option[] {
  return [
    { key: "strong", label: "Уверенно применяю на практике и могу объяснить принятые решения", confirmsRequirement: true },
    { key: "limited", label: "Применял(а) эпизодически, без уверенного рабочего уровня", confirmsRequirement: false },
    { key: "theory", label: "Есть только базовое теоретическое понимание", confirmsRequirement: false },
    { key: "custom", label: "Другой уровень — опишу своими словами", custom: true, confirmsRequirement: false },
    { key: "no", label: "Нет, этим знанием не владею", confirmsRequirement: false },
  ];
}

function experienceLabel(company: string | null, position: string | null) {
  return [company, position].filter(Boolean).join(" — ") || null;
}

function practiceOptions(resumeJson: string): Option[] {
  const context = readResumeQuestionContext(resumeJson);
  const seen = new Set<string>();
  const workplaces = context.experiences.flatMap((item) => {
    const label = experienceLabel(item.company, item.position);
    const key = label?.toLowerCase() || "";
    if (!label || seen.has(key)) return [];
    seen.add(key);
    return [{
      key: `work_${item.sourceIndex}`,
      label: `${label} — опишу конкретную задачу и результат`,
      custom: true,
      confirmsRequirement: true,
    }];
  }).slice(0, 2);
  const other = workplaces.length ? [{
    key: "other_work", label: "Другое место работы — укажу компанию, задачу и результат",
    custom: true, confirmsRequirement: true,
  }] : [{
    key: "work", label: "Есть рабочий опыт — опишу задачу, контекст и результат",
    custom: true, confirmsRequirement: true,
  }];
  return [
    ...workplaces, ...other,
    { key: "non_commercial", label: "Только учебный или личный проект — опишу контекст", custom: true, confirmsRequirement: false },
    { key: "no", label: "Нет, практического опыта с этим нет", confirmsRequirement: false },
  ];
}

export function createAdaptationGapQuestions(params: {
  resumeJson: string;
  vacancy: NormalizedVacancy;
  fit: ResumeVacancyFitResult;
}): ClarifyingQuestion[] {
  return rankUncoveredCriteria(params).map((criterion, index) => ({
    id: `adaptation-gap-${index + 1}`,
    question: questionText(criterion),
    targetArea: criterion.kind === "skill" ? "tools" : criterion.kind,
    requirement: criterion.text,
    kind: criterion.evidence === "knowledge" ? "knowledge"
      : criterion.evidence === "credential" ? "profile" : "experience",
    purpose: "gap",
    topic: criterion.kind === "education" ? "development" : "hard_skill",
    options: criterion.evidence === "credential" ? credentialOptions()
      : criterion.evidence === "knowledge" ? knowledgeOptions()
        : practiceOptions(params.resumeJson),
  }));
}
