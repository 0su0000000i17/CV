import { z } from "zod";

const answerSchema = z.object({
  questionId: z.string().trim().min(1).max(100),
  optionKey: z.string().trim().min(1).max(100).optional(),
  optionKeys: z.array(z.string().trim().min(1).max(100)).min(1).max(10).optional(),
  customText: z.string().trim().max(500).optional(),
}).strict().refine(
  (answer) => Boolean(answer.optionKey || answer.optionKeys?.length),
  { message: "Ответ должен содержать optionKey или optionKeys" },
);

export const clarifyingAnswersSchema = z.object({
  answers: z.array(answerSchema).min(1).max(50).optional(),
  skipped: z.literal(true).optional(),
}).strict().refine(
  (value) => Boolean(value.answers?.length || value.skipped),
  { message: "Нужно передать ответы или пропуск" },
);
