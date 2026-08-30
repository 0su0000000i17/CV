import type { Request, Response } from "express";

import { getAiProvider } from "../ai/get-ai-provider.js";
import { sendError, sendServerError } from "../utils/api-responses.js";

function isAiTestEndpointEnabled() {
  return (
    process.env.AI_TEST_ENABLED === "true" &&
    process.env.NODE_ENV !== "production"
  );
}

function getTestPrompt(req: Request) {
  const prompt = req.body?.prompt;

  if (typeof prompt !== "string") {
    return "Ответь одним коротким предложением: backend AI integration works.";
  }

  const trimmedPrompt = prompt.trim();

  if (!trimmedPrompt) {
    return "Ответь одним коротким предложением: backend AI integration works.";
  }

  return trimmedPrompt.slice(0, 1_000);
}

export async function testAiProvider(req: Request, res: Response) {
  try {
    if (!isAiTestEndpointEnabled()) {
      return sendError(res, 404, "API route not found");
    }

    const aiProvider = getAiProvider();
    const prompt = getTestPrompt(req);

    const result = await aiProvider.generateText({
      messages: [
        {
          role: "system",
          content:
            "Ты тестируешь backend-интеграцию AI provider. Отвечай кратко и без markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      maxTokens: 120,
    });

    return res.json({
      provider: result.provider,
      model: result.model,
      text: result.text,
    });
  } catch (error) {
    return sendServerError(res, "AI provider test failed", error);
  }
}
