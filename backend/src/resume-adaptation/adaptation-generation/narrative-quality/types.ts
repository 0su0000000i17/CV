export type NarrativeQualityIssue = {
  location: string;
  reason: string;
  severity: "blocking" | "advisory";
  text?: string;
};

export type NarrativeSourcePayload = {
  additional?: { about?: string[] };
  experience?: {
    items?: Array<{
      sourceIndex?: number;
      blocks?: Array<{ type?: string; text?: string | null }>;
    }>;
  };
};
