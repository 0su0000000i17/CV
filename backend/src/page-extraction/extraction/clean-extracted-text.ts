import {
  MAX_EXTRACTED_TEXT_CHARS,
  MIN_EXTRACTED_TEXT_CHARS,
} from "../constants.js";
import type { PageExtractionStatus } from "../types.js";

type CleanExtractedTextResult = {
  text: string;
  isTextLimited: boolean;
};

type ExtractedTextValidationResult =
  | {
      ok: true;
      confidence: number;
    }
  | {
      ok: false;
      status: PageExtractionStatus;
      message: string;
      confidence: number;
    };

const BAD_PAGE_PATTERNS = [
  /captcha/i,
  /подтвердите,\s*что\s*вы\s*не\s*робот/i,
  /проверка\s*безопасности/i,
  /access\s*denied/i,
  /forbidden/i,
  /too\s*many\s*requests/i,
];

const UNIVERSAL_UI_NOISE_PATTERNS = [
  /^войти$/i,
  /^регистрация$/i,
  /^login$/i,
  /^sign\s+in$/i,
  /^sign\s+up$/i,
  /^поделиться$/i,
  /^share$/i,
  /^cookie$/i,
  /^cookies$/i,
  /^accept\s+all$/i,
  /^accept\s+cookies$/i,
  /^принять$/i,
  /^отклонить$/i,
  /^откликнуться$/i,
  /^загрузить$/i,
  /^продолжить$/i,
  /^обязательное\s+поле$/i,
  /^номер\s+телефона$/i,
  /^напишите\s+телефон/i,
  /^продолжая,\s*вы\s+принимаете/i,
  /^соглашение\s+и\s+политик/i,
  /^задать\s+вопрос\s+работодателю$/i,
  /^задайте\s+вопрос\s+работодателю$/i,
  /^где\s+предстоит\s+работать$/i,
  /^все\s+вакансии$/i,
  /^мэтч$/i,
  /^загрузи\s+резюме/i,
  /^генерация\s+резюме\s+под\s+вакансию$/i,
  /^сопроводительное\s+письмо$/i,
  /^зарплата\s+по\s+оценке\s+ai$/i,
  /^email$/i,
  /^посмотреть$/i,
];

const STANDALONE_NAVIGATION_PATTERNS = [
  /^описание$/i,
  /^задачи$/i,
  /^требования$/i,
  /^условия$/i,
  /^навыки$/i,
  /^грейд$/i,
  /^формат$/i,
  /^зарплата$/i,
  /^разработка$/i,
];

const PUBLICATION_META_PATTERNS = [
  /^дата\s+публикации/i,
  /^вакансия\s+опубликована/i,
  /^опубликована\s+\d+/i,
  /^сегодня$/i,
  /^вчера$/i,
  /^\d+\s+июн$/i,
  /^\d+\s+июня$/i,
];

const PLATFORM_METRIC_PATTERNS = [
  /^вакансия$/i,
  /^в\s+среднем$/i,
  /^в\s+пределах\s+рынка$/i,
  /^ниже\s+рынка/i,
  /^выше\s+рынка/i,
  /^\d+(\s|\u00a0)?\d*\s?₽$/i,
  /^~\s?\d+(\s|\u00a0)?\d*\s?₽$/i,
  /^\d+(\.\d+)?$/i,
  /^\d+\s+отзыв/i,
  /^\d+\s+похож/i,
  /^сейчас\s+эту\s+вакансию\s+смотр/i,
];

const TAIL_SECTION_PATTERNS = [
  /^похожие\s+вакансии$/i,
  /^вакансии\s+из\s+других\s+подборок$/i,
  /^статьи\s+для\s+разработчиков$/i,
  /^прозрачные\s+зарплаты/i,
  /^анонимные\s+данные/i,
  /^контакты$/i,
  /^другой\s+вопрос$/i,
  /^он\s+получит\s+его/i,
  /^где\s+располагается\s+место\s+работы\??$/i,
  /^какой\s+график\s+работы\??$/i,
  /^вакансия\s+открыта\??$/i,
  /^какая\s+оплата\s+труда\??$/i,
  /^как\s+с\s+вами\s+связаться\??$/i,
  /^добавить\s+в\s+отклики$/i,
  /^если\s+просят\s+войти/i,
  /^all\s+jobs$/i,
  /^similar\s+jobs$/i,
  /^related\s+jobs$/i,
  /^contacts$/i,
];

export function cleanExtractedText(text: string): CleanExtractedTextResult {
  const rawLines = text
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => normalizeLine(line))
    .filter(Boolean);

  const cleanedLines: string[] = [];
  const seenLines = new Set<string>();

  let meaningfulChars = 0;

  for (const line of rawLines) {
    const normalizedKey = normalizeForDedupe(line);

    if (!normalizedKey || seenLines.has(normalizedKey)) {
      continue;
    }

    if (isAlwaysNoiseLine(line)) {
      continue;
    }

    if (isTailSectionLine(line) && meaningfulChars >= 700) {
      break;
    }

    if (isTailSectionLine(line)) {
      continue;
    }

    seenLines.add(normalizedKey);
    cleanedLines.push(line);

    meaningfulChars += countMeaningfulChars(line);
  }

  const cleanedText = cleanedLines.join("\n").trim();

  if (cleanedText.length <= MAX_EXTRACTED_TEXT_CHARS) {
    return {
      text: cleanedText,
      isTextLimited: false,
    };
  }

  return {
    text: cleanedText.slice(0, MAX_EXTRACTED_TEXT_CHARS).trim(),
    isTextLimited: true,
  };
}

export function validateExtractedText(
  text: string
): ExtractedTextValidationResult {
  if (BAD_PAGE_PATTERNS.some((pattern) => pattern.test(text))) {
    return {
      ok: false,
      status: "captcha_or_bot_check",
      message:
        "Страница показала защиту или captcha. Вставьте текст вакансии вручную.",
      confidence: 0.05,
    };
  }

  const compactLength = text.replace(/\s/g, "").length;

  if (compactLength < MIN_EXTRACTED_TEXT_CHARS) {
    return {
      ok: false,
      status: "content_too_short",
      message:
        "Не удалось извлечь достаточно текста. Вставьте описание вакансии вручную.",
      confidence: 0.15,
    };
  }

  return {
    ok: true,
    confidence: Math.min(0.9, 0.45 + compactLength / 8000),
  };
}

function normalizeLine(line: string) {
  return line.replace(/\s+/g, " ").trim();
}

function normalizeForDedupe(line: string) {
  return line
    .toLowerCase()
    .replace(/[.,;:!?()[\]{}"«»]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isAlwaysNoiseLine(line: string) {
  return (
    UNIVERSAL_UI_NOISE_PATTERNS.some((pattern) => pattern.test(line)) ||
    STANDALONE_NAVIGATION_PATTERNS.some((pattern) => pattern.test(line)) ||
    PUBLICATION_META_PATTERNS.some((pattern) => pattern.test(line)) ||
    PLATFORM_METRIC_PATTERNS.some((pattern) => pattern.test(line))
  );
}

function isTailSectionLine(line: string) {
  return TAIL_SECTION_PATTERNS.some((pattern) => pattern.test(line));
}

function countMeaningfulChars(line: string) {
  if (isAlwaysNoiseLine(line) || isTailSectionLine(line)) {
    return 0;
  }

  return line.replace(/\s/g, "").length;
}