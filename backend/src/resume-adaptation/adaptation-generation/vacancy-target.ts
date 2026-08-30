import type { NormalizedVacancy } from "../../vacancy-ai/types.js";
import type { ResumeAdaptationResult } from "../types.js";

export function applyVacancyTarget(
  adaptation: ResumeAdaptationResult,
  vacancy: NormalizedVacancy,
): ResumeAdaptationResult {
  return {
    ...adaptation,
    target: {
      ...adaptation.target,
      title: vacancy.title ?? adaptation.target.title,
      company: vacancy.company ?? adaptation.target.company,
      seniority: vacancy.seniority ?? adaptation.target.seniority,
      salary: vacancy.salary ?? adaptation.target.salary,
      employment: vacancy.employment ?? adaptation.target.employment,
      schedule: vacancy.schedule ?? adaptation.target.schedule,
      workFormat: vacancy.workFormat ?? adaptation.target.workFormat,
    },
  };
}
