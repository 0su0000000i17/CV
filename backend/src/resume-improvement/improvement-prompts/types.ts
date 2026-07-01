export type ResumePromptPayload = {
  personal?: { gender?: string | null };
  target?: { title?: string | null };
  experience?: {
    items?: Array<{
      sourceIndex?: number;
      company?: { name?: string | null };
      position?: string | null;
      dates?: { start?: string | null; end?: string | null };
      blocks?: Array<{ type?: string; text?: string | null }>;
    }>;
  };
};
