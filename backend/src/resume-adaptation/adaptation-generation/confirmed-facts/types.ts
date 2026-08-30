export type DumpedConfirmedFact = {
  location: "additionalInfo" | "summary";
  text: string;
};

export type ExperienceCompanyRef = {
  sourceIndex: number;
  name: string;
};

export type ParsedConfirmedFact = {
  raw: string;
  questionId: string | null;
  kind: string | null;
  purpose: string | null;
  topic: string | null;
  integration: string | null;
  sourceIndex: number | null;
  question: string;
  answer: string;
  refusal: boolean;
};

export type MisroutedCompanyFact = {
  fact: string;
  company: string;
  sourceIndex: number;
};
