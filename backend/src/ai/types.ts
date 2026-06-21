export type AiMessageRole = "system" | "user" | "assistant";

export type AiMessage = {
  role: AiMessageRole;
  content: string;
};

export type AiGenerateTextParams = {
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
};

export type AiGenerateTextResult = {
  text: string;
  provider: string;
  model: string;
};

export type AiProvider = {
  generateText(params: AiGenerateTextParams): Promise<AiGenerateTextResult>;
};
