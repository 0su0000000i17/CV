import type {
  AiResumeAnalysis,
  ResumeRedFlag,
} from "../schemas/resume-analysis-schema.js";
import { addHeuristicFlag } from "./resume-heuristics/flags.js";
import {
  hasDirectRoleMatch,
  hasGenericRecentTitles,
  isMiddleOrHigher,
} from "./resume-heuristics/role-match.js";
import {
  hasUncorroboratedSkillDump,
  hasWallOfText,
} from "./resume-heuristics/content-quality.js";

type HeuristicResult = {
  analysis: AiResumeAnalysis;
  heuristicFlags: string[];
};

export function detectResumeHeuristics(
  rawAnalysis: AiResumeAnalysis,
  resumeMarkdown: string
): HeuristicResult {
  const addedFlags: ResumeRedFlag[] = [];
  const heuristicFlags: string[] = [];
  const directRoleMatch = hasDirectRoleMatch(rawAnalysis, resumeMarkdown);
  const isSeniorTarget = isMiddleOrHigher(rawAnalysis);

  if (!directRoleMatch && hasGenericRecentTitles(rawAnalysis)) {
    addHeuristicFlag(rawAnalysis, addedFlags, "role_mismatch", "critical",
      "Заявленная роль плохо подтверждается названиями последних должностей: в опыте видны общие должности специалиста, а не прямые developer/engineer/QA роли.");
    heuristicFlags.push("role_mismatch_from_recent_titles");
  }

  if (!directRoleMatch && isSeniorTarget) {
    addHeuristicFlag(rawAnalysis, addedFlags, "inflated_level", "critical",
      "Заявленный уровень Middle/Senior/Lead выглядит завышенным: последние должности не подтверждают прямой опыт на таком уровне.");
    heuristicFlags.push("inflated_level_from_target_level");
  }

  if (["weak", "partial"].includes(rawAnalysis.relevantExperience) && isSeniorTarget) {
    addHeuristicFlag(rawAnalysis, addedFlags, "inflated_level", "major",
      "Релевантный опыт не выглядит достаточным для заявленного уровня.");
    heuristicFlags.push("inflated_level_from_relevance");
  }

  if (hasUncorroboratedSkillDump(resumeMarkdown)) {
    addHeuristicFlag(rawAnalysis, addedFlags, "keyword_stuffing", "major",
      "Больше половины навыков из списка не подтверждаются нигде в опыте или описании: рекрутеры и алгоритм hh.ru воспринимают такой список как накрутку ключевых слов.");
    heuristicFlags.push("uncorroborated_skill_dump");
  }

  if (hasWallOfText(resumeMarkdown)) {
    addHeuristicFlag(rawAnalysis, addedFlags, "low_scanability", "major",
      "В резюме есть сплошной текстовый блок без структуры: при первичном просмотре рекрутер не выхватит из него главное — разбейте его на короткие пункты.");
    heuristicFlags.push("wall_of_text");
  }

  return {
    analysis: { ...rawAnalysis, redFlags: [...rawAnalysis.redFlags, ...addedFlags] },
    heuristicFlags,
  };
}
