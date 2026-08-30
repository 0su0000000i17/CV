type ClarifyingQuestionOption = {
  key: string;
  label: string;
  custom?: boolean;
  confirmsRequirement?: boolean;
};

// Determines where a confirmed answer is placed in the resume.
export type ClarifyingQuestionKind = "experience" | "knowledge" | "profile";

export type ClarifyingQuestionPurpose = "gap" | "evidence" | "positioning";

export type ClarifyingQuestionTopic =
  | "positioning"
  | "achievement"
  | "metrics"
  | "hard_skill"
  | "soft_skill"
  | "collaboration"
  | "leadership"
  | "development";

export type ClarifyingQuestion = {
  id: string;
  question: string;
  targetArea: string;
  sourceIndex?: number;
  requirement?: string;
  kind?: ClarifyingQuestionKind;
  purpose?: ClarifyingQuestionPurpose;
  topic?: ClarifyingQuestionTopic;
  multiple?: boolean;
  options: ClarifyingQuestionOption[];
};

export type ClarifyingQuestionsAiResult = {
  questions: ClarifyingQuestion[];
};

export type ClarifyingAnswer = {
  questionId: string;
  optionKey?: string;
  optionKeys?: string[];
  customText?: string;
};

export type ResumeAnalysisSignals = {
  weaknesses?: string[];
  atsIssues?: string[];
  missingKeywords?: string[];
  recommendations?: string[];
  suggestedHeadline?: string;
  redFlags?: Array<{ type: string; explanation: string }>;
};
