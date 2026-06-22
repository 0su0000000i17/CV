import type { PageExtractionMethod } from "../page-extraction/types.js";

export type VacancySourceMetadata = {
  method: PageExtractionMethod;
  sourceUrl?: string;
  finalUrl?: string;
  title?: string | null;
  description?: string | null;
};

export type NormalizedVacancy = {
  isVacancy: boolean;
  rejectionReason: string | null;

  title: string | null;
  company: string | null;
  location: string | null;
  salary: string | null;
  employment: string | null;
  workFormat: string | null;
  schedule: string | null;
  seniority: string | null;

  summary: string | null;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  conditions: string[];
  skills: string[];

  warnings: string[];
  confidence: number | null;
};

export type VacancyNormalizationResult =
  | {
      ok: true;
      vacancy: NormalizedVacancy;
      rawResponse: string;
    }
  | {
      ok: false;
      message: string;
      rawResponse?: string;
    };