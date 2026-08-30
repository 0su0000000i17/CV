export type ChangeExplanation = {
  id: string;
  section: string;
  before: string;
  after: string;
  reason: string;
  evidence: string[];
};

export type SourceExperience = {
  sourceIndex: number;
  company: string;
  position: string;
  text: string;
};
