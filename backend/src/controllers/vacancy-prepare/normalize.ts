import { cleanExtractedText, validateExtractedText } from "../../page-extraction/extraction/clean-extracted-text.js";
import { extractPageFromUrl } from "../../page-extraction/extract-page-from-url.js";
import type {
  PageExtractionMethod,
  StructuredJobPosting,
} from "../../page-extraction/types.js";
import { formatVacancyForAdaptation } from "../../vacancy-ai/format-vacancy-for-adaptation.js";
import { normalizeVacancyWithAi } from "../../vacancy-ai/normalize-vacancy-with-ai.js";
import { normalizeStructuredJobPosting } from "../../vacancy-ai/normalization/structured-job-posting.js";
import { normalizeStructuredVacancyText } from "../../vacancy-ai/normalization/structured-text.js";
import type { VacancySourceMetadata } from "../../vacancy-ai/types.js";
import type { VacancyPrepareResult } from "./types.js";

async function normalizePreparedVacancy(params: {
  text: string;
  method: PageExtractionMethod;
  sourceUrl?: string;
  finalUrl?: string;
  title?: string | null;
  description?: string | null;
  structuredVacancy?: StructuredJobPosting | null;
}): Promise<VacancyPrepareResult> {
  const validation = validateExtractedText(params.text);
  const base = {
    sourceUrl: params.sourceUrl,
    finalUrl: params.finalUrl,
    method: params.method,
  };
  if (!validation.ok) {
    return { ...base, status: validation.status, message: validation.message, confidence: validation.confidence };
  }
  const metadata: VacancySourceMetadata = { ...base, title: params.title, description: params.description };
  const structured = params.structuredVacancy
    ? normalizeStructuredJobPosting({ posting: params.structuredVacancy, metadata }) : null;
  const structuredText = structured ? null
    : normalizeStructuredVacancyText({ text: params.text, metadata });
  const normalized = structured
    ? { ok: true as const, vacancy: structured, rawResponse: "schema-org-job-posting-v1" }
    : structuredText
      ? { ok: true as const, vacancy: structuredText, rawResponse: "structured-vacancy-text-v1" }
    : await normalizeVacancyWithAi({ text: params.text, metadata });
  if (!normalized.ok) {
    return { ...base, status: "ai_failed", message: normalized.message, confidence: 0 };
  }
  if (!normalized.vacancy.isVacancy) {
    return {
      ...base,
      status: "not_vacancy",
      message: normalized.vacancy.rejectionReason ||
        "Похоже, это не описание вакансии. Вставьте ссылку на вакансию или полный текст вакансии.",
      confidence: normalized.vacancy.confidence ?? 0.1,
      vacancy: normalized.vacancy,
    };
  }
  const text = formatVacancyForAdaptation(normalized.vacancy);
  if (!text) {
    return {
      ...base,
      status: "ai_failed",
      message: "Вакансия распознана, но не удалось подготовить структурированный текст. Вставьте описание вручную.",
      confidence: 0,
    };
  }
  return {
    ...base,
    status: "success",
    message: "Вакансия распознана и подготовлена для адаптации.",
    confidence: normalized.vacancy.confidence ?? validation.confidence,
    page: {
      title: normalized.vacancy.title,
      description: normalized.vacancy.summary,
      text,
      textLength: text.length,
      isTextLimited: false,
    },
    vacancy: normalized.vacancy,
  };
}

function inputKind(input: string): "url" | "text" {
  const value = input.trim();
  if (value.includes("\n") || /\s/u.test(value)) return "text";
  const candidate = /^[a-zA-Z][a-zA-Z\d+.-]*:/u.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".")
      ? "url" : "text";
  } catch {
    return "text";
  }
}

export async function prepareVacancyInput(input: string): Promise<VacancyPrepareResult> {
  if (inputKind(input) === "url") {
    const extracted = await extractPageFromUrl(input);
    if (extracted.status !== "success" || !extracted.page?.text) return extracted;
    return normalizePreparedVacancy({
      text: extracted.page.text,
      method: "playwright_rendered_dom",
      sourceUrl: extracted.sourceUrl,
      finalUrl: extracted.finalUrl,
      title: extracted.page.title,
      description: extracted.page.description,
      structuredVacancy: extracted.page.structuredVacancy,
    });
  }
  const cleaned = cleanExtractedText(input);
  const validation = validateExtractedText(cleaned.text);
  if (!validation.ok) {
    return { status: validation.status, message: validation.message, method: "pasted_text", confidence: validation.confidence };
  }
  return normalizePreparedVacancy({
    text: cleaned.text,
    method: "pasted_text",
    title: null,
    description: null,
  });
}
