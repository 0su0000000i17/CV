export type ResumeTextBlock =
  | {
      id: string;
      type: "sectionTitle";
      title: string;
      gapBefore?: boolean;
      sourceLineIds?: string[];
    }
  | {
      id: string;
      type: "paragraph";
      text: string;
      gapBefore?: boolean;
      sourceLineIds?: string[];
    }
  | {
      id: string;
      type: "bullet";
      text: string;
      gapBefore?: boolean;
      sourceLineIds?: string[];
    }
  | {
      id: string;
      type: "stack";
      label: string;
      raw: string;
      items: string[];
      gapBefore?: boolean;
      sourceLineIds?: string[];
    };
