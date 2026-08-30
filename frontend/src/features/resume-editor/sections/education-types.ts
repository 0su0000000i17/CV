export type EducationEntry = {
  year: string;
  level: string | null;
  title: string;
  details: string[];
};

export type EducationGroup = {
  title: string;
  entries: EducationEntry[];
};
