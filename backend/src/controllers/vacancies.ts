import type { Request, Response } from "express";
import { z } from "zod";

import { cleanExtractedText, validateExtractedText } from "../page-extraction/extraction/cleanExtractedText.js";
import { extractPageFromUrl } from "../page-extraction/extractPageFromUrl.js";
import type { PageExtractionMethod } from "../page-extraction/types.js";
import { formatVacancyForAdaptation } from "../vacancy-ai/formatVacancyForAdaptation.js";
import { normalizeVacancyWithAi } from "../vacancy-ai/normalizeVacancyWithAi.js";
import type { VacancySourceMetadata } from "../vacancy-ai/types.js";
import { sendError, sendServerError } from "../utils/apiResponses.js";
import { getUserFromRequest } from "../utils/auth.js";

const extractVacancyUrlSchema = z.object({
  url: z.string().trim().min(1).max(2048),
});

const prepareVacancyInputSchema = z.object({
  input: z.string().trim().min(1).max(80_000),
});

export async function extractVacancyUrlController(
  req: Request,
  res: Response
) {
  try {
    const { user } = await getUserFromRequest(req);

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    const parsedBody = extractVacancyUrlSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return sendError(res, 400, "Некорректная ссылка.");
    }

    const result = await extractPageFromUrl(parsedBody.data.url);

    return res.json(result);
  } catch (error) {
    return sendServerError(res, "Failed to extract page text", error);
  }
}

export async function prepareVacancyInputController(
  req: Request,
  res: Response
) {
  try {
    const { user } = await getUserFromRequest(req);

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    const parsedBody = prepareVacancyInputSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return sendError(res, 400, "Вставьте ссылку или текст вакансии.");
    }

    const input = parsedBody.data.input;
    const inputKind = getVacancyInputKind(input);

    if (inputKind === "url") {
      const extracted = await extractPageFromUrl(input);

      if (extracted.status !== "success" || !extracted.page?.text) {
        return res.json(extracted);
      }

      const result = await normalizePreparedVacancy({
        text: extracted.page.text,
        method: "playwright_rendered_dom",
        sourceUrl: extracted.sourceUrl,
        finalUrl: extracted.finalUrl,
        title: extracted.page.title,
        description: extracted.page.description,
      });

      return res.json(result);
    }

    const cleaned = cleanExtractedText(input);
    const validation = validateExtractedText(cleaned.text);

    if (!validation.ok) {
      return res.json({
        status: validation.status,
        message: validation.message,
        method: "pasted_text",
        confidence: validation.confidence,
      });
    }

    const result = await normalizePreparedVacancy({
      text: cleaned.text,
      method: "pasted_text",
      title: null,
      description: null,
    });

    return res.json(result);
  } catch (error) {
    return sendServerError(res, "Failed to prepare vacancy input", error);
  }
}

async function normalizePreparedVacancy(params: {
  text: string;
  method: PageExtractionMethod;
  sourceUrl?: string;
  finalUrl?: string;
  title?: string | null;
  description?: string | null;
}) {
  const validation = validateExtractedText(params.text);

  if (!validation.ok) {
    return {
      status: validation.status,
      message: validation.message,
      sourceUrl: params.sourceUrl,
      finalUrl: params.finalUrl,
      method: params.method,
      confidence: validation.confidence,
    };
  }

  const metadata: VacancySourceMetadata = {
    method: params.method,
    sourceUrl: params.sourceUrl,
    finalUrl: params.finalUrl,
    title: params.title,
    description: params.description,
  };

  const normalized = await normalizeVacancyWithAi({
    text: params.text,
    metadata,
  });

  if (!normalized.ok) {
    return {
      status: "ai_failed",
      message: normalized.message,
      sourceUrl: params.sourceUrl,
      finalUrl: params.finalUrl,
      method: params.method,
      confidence: 0,
    };
  }

  if (!normalized.vacancy.isVacancy) {
    return {
      status: "not_vacancy",
      message:
        normalized.vacancy.rejectionReason ||
        "Похоже, это не описание вакансии. Вставьте ссылку на вакансию или полный текст вакансии.",
      sourceUrl: params.sourceUrl,
      finalUrl: params.finalUrl,
      method: params.method,
      confidence: normalized.vacancy.confidence ?? 0.1,
      vacancy: normalized.vacancy,
    };
  }

  const preparedText = formatVacancyForAdaptation(normalized.vacancy);

  if (!preparedText) {
    return {
      status: "ai_failed",
      message:
        "Вакансия распознана, но не удалось подготовить структурированный текст. Вставьте описание вручную.",
      sourceUrl: params.sourceUrl,
      finalUrl: params.finalUrl,
      method: params.method,
      confidence: 0,
    };
  }

  return {
    status: "success",
    message: "Вакансия распознана и подготовлена для адаптации.",
    sourceUrl: params.sourceUrl,
    finalUrl: params.finalUrl,
    method: params.method,
    confidence: normalized.vacancy.confidence ?? validation.confidence,
    page: {
      title: normalized.vacancy.title,
      description: normalized.vacancy.summary,
      text: preparedText,
      textLength: preparedText.length,
      isTextLimited: false,
    },
    vacancy: normalized.vacancy,
  };
}

function getVacancyInputKind(input: string): "url" | "text" {
  const trimmedInput = input.trim();

  if (trimmedInput.includes("\n") || /\s/.test(trimmedInput)) {
    return "text";
  }

  const inputWithProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmedInput)
    ? trimmedInput
    : `https://${trimmedInput}`;

  try {
    const url = new URL(inputWithProtocol);

    if (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname.includes(".")
    ) {
      return "url";
    }

    return "text";
  } catch {
    return "text";
  }
}