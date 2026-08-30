import type { ResumeTextBlock } from "./resume-text-block.js";

export type SourceResumeExperience = {
  total: string | null;
  items: Array<{
    id: string;
    sourceIndex: number;
    dates: {
      start: string | null;
      end: string | null;
      duration: string | null;
      raw: string[];
    };
    company: {
      name: string | null;
      city: string | null;
      url: string | null;
      industries: string[];
      raw: string[];
    };
    position: string | null;
    blocks: ResumeTextBlock[];
    raw: string[];
  }>;
  raw: string[];
};
