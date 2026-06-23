import type {
  AiResumeAnalysis,
  ResumeRedFlag,
  ResumeRedFlagType,
} from "../schemas/resume-analysis-schema.js";

type HeuristicResult = {
  analysis: AiResumeAnalysis;
  heuristicFlags: string[];
};

const developerTargetPattern =
  /backend|frontend|fullstack|full-stack|python|go|golang|java|javascript|typescript|node|react|разработчик|developer|engineer|программист/i;

const qaTargetPattern = /qa|quality|тестиров|тестировщик|инженер по тестированию/i;

const developerRolePattern =
  /backend|frontend|fullstack|full-stack|python|go|golang|java|javascript|typescript|node|react|разработчик|developer|engineer|программист/i;

const qaRolePattern = /qa|quality|тестиров|тестировщик|инженер по тестированию/i;

const genericSpecialistPattern =
  /ведущий специалист|младший специалист|специалист|бухгалтер|менеджер|администратор/i;

function hasFlag(analysis: AiResumeAnalysis, type: ResumeRedFlagType) {
  return analysis.redFlags.some((flag) => flag.type === type);
}

function addFlag(
  analysis: AiResumeAnalysis,
  flags: ResumeRedFlag[],
  type: ResumeRedFlagType,
  severity: ResumeRedFlag["severity"],
  explanation: string
) {
  if (hasFlag(analysis, type) || flags.some((flag) => flag.type === type)) {
    return;
  }

  flags.push({
    type,
    severity,
    explanation,
  });
}

function getRecentRolesText(analysis: AiResumeAnalysis) {
  return analysis.recentRoles.join(" ").toLowerCase();
}

function getTargetText(analysis: AiResumeAnalysis) {
  return `${analysis.targetRole} ${analysis.targetLevel}`.toLowerCase();
}

function hasDirectRoleMatch(analysis: AiResumeAnalysis) {
  const targetText = getTargetText(analysis);
  const recentRolesText = getRecentRolesText(analysis);

  if (developerTargetPattern.test(targetText)) {
    return developerRolePattern.test(recentRolesText);
  }

  if (qaTargetPattern.test(targetText)) {
    return qaRolePattern.test(recentRolesText);
  }

  return true;
}

function hasGenericRecentTitles(analysis: AiResumeAnalysis) {
  const recentRolesText = getRecentRolesText(analysis);

  return genericSpecialistPattern.test(recentRolesText);
}

function isMiddleOrHigher(analysis: AiResumeAnalysis) {
  return ["middle", "senior", "lead"].includes(analysis.targetLevel);
}

function hasLargeSkillDump(markdown: string) {
  const skillsMatch = markdown.match(/Навыки([\s\S]{0,1200})/i);

  if (!skillsMatch?.[1]) {
    return false;
  }

  const skillsText = skillsMatch[1];
  const roughSkillCount = skillsText
    .split(/\s{2,}|,|\n|•|;/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1).length;

  return roughSkillCount >= 25;
}

function hasTooLongParagraphs(markdown: string) {
  return markdown
    .split(/\n{2,}/)
    .some((paragraph) => paragraph.trim().length > 900);
}

export function detectResumeHeuristics(
  rawAnalysis: AiResumeAnalysis,
  resumeMarkdown: string
): HeuristicResult {
  const addedFlags: ResumeRedFlag[] = [];
  const heuristicFlags: string[] = [];

  const directRoleMatch = hasDirectRoleMatch(rawAnalysis);
  const genericRecentTitles = hasGenericRecentTitles(rawAnalysis);

  if (!directRoleMatch && genericRecentTitles) {
    addFlag(
      rawAnalysis,
      addedFlags,
      "role_mismatch",
      "critical",
      "Заявленная роль плохо подтверждается названиями последних должностей: в опыте видны общие должности специалиста, а не прямые developer/engineer/QA роли."
    );
    heuristicFlags.push("role_mismatch_from_recent_titles");
  }

  if (!directRoleMatch && isMiddleOrHigher(rawAnalysis)) {
    addFlag(
      rawAnalysis,
      addedFlags,
      "inflated_level",
      "critical",
      "Заявленный уровень Middle/Senior/Lead выглядит завышенным: последние должности не подтверждают прямой опыт на таком уровне."
    );
    heuristicFlags.push("inflated_level_from_target_level");
  }

  if (
    rawAnalysis.relevantExperience === "weak" ||
    rawAnalysis.relevantExperience === "partial"
  ) {
    if (isMiddleOrHigher(rawAnalysis)) {
      addFlag(
        rawAnalysis,
        addedFlags,
        "inflated_level",
        "major",
        "Релевантный опыт не выглядит достаточным для заявленного уровня."
      );
      heuristicFlags.push("inflated_level_from_relevance");
    }
  }

  if (hasLargeSkillDump(resumeMarkdown)) {
    addFlag(
      rawAnalysis,
      addedFlags,
      "keyword_stuffing",
      "major",
      "Блок навыков выглядит перегруженным: много технологий перечислены списком, но не все явно подтверждены опытом."
    );
    heuristicFlags.push("large_skill_dump");
  }

  if (hasTooLongParagraphs(resumeMarkdown)) {
    addFlag(
      rawAnalysis,
      addedFlags,
      "low_scanability",
      "major",
      "В резюме есть слишком длинные текстовые блоки, из-за чего его сложнее быстро просканировать рекрутеру."
    );
    heuristicFlags.push("long_paragraphs");
  }

  return {
    analysis: {
      ...rawAnalysis,
      redFlags: [...rawAnalysis.redFlags, ...addedFlags],
    },
    heuristicFlags,
  };
}