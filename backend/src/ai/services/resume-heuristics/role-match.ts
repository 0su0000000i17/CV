import type { AiResumeAnalysis } from "../../schemas/resume-analysis-schema.js";

const developerTargetPattern =
  /backend|frontend|fullstack|full-stack|python|go|golang|java|javascript|typescript|node|react|разработчик|developer|engineer|программист/i;
const qaTargetPattern = /qa|quality|тестиров|тестировщик|инженер по тестированию/i;
const genericSpecialistPattern =
  /ведущий специалист|младший специалист|специалист|бухгалтер|менеджер|администратор/i;
const developerStackEvidencePattern =
  /\bpython\b|django|flask|fastapi|\bjava\b(?!script)|kotlin|c\+\+|c#|\bgo\b|golang|typescript|\bnode(?:\.?js)?\b|\breact\b|vue|angular|spring|kafka|rabbitmq|docker|kubernetes|\bk8s\b|postgres(?:ql)?|mysql|mongodb|redis|elasticsearch|graphql|grpc|microservices|ci\/cd|jenkins|gitlab\s*ci|terraform|airflow|\bspark\b|hadoop|tensorflow|pytorch|\bsql\b/i;
const qaStackEvidencePattern =
  /selenium|playwright|cypress|postman|swagger|junit|pytest|testrail|allure|jmeter|api[\s-]?тестир|нагрузочн\w*\s+тестир|автотест|тест[- ]?кейс|баг[- ]?трекинг|\bjira\b/i;

function targetText(analysis: AiResumeAnalysis) {
  return `${analysis.targetRole} ${analysis.targetLevel}`.toLowerCase();
}

function recentRolesText(analysis: AiResumeAnalysis) {
  return analysis.recentRoles.join(" ").toLowerCase();
}

export function hasDirectRoleMatch(
  analysis: AiResumeAnalysis,
  resumeMarkdown: string
) {
  const target = targetText(analysis);
  const roles = recentRolesText(analysis);
  const relevance = !["none", "weak"].includes(analysis.relevantExperience);
  if (developerTargetPattern.test(target)) {
    return developerTargetPattern.test(roles) ||
      (relevance && developerStackEvidencePattern.test(resumeMarkdown));
  }
  if (qaTargetPattern.test(target)) {
    return qaTargetPattern.test(roles) ||
      (relevance && qaStackEvidencePattern.test(resumeMarkdown));
  }
  return true;
}

export function hasGenericRecentTitles(analysis: AiResumeAnalysis) {
  return genericSpecialistPattern.test(recentRolesText(analysis));
}

export function isMiddleOrHigher(analysis: AiResumeAnalysis) {
  return ["middle", "senior", "lead"].includes(analysis.targetLevel);
}
