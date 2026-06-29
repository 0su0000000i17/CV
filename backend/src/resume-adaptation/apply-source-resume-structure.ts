import type { SourceResumeDocument } from "../resume-document/types.js";
import { sourceDocumentToEditableResume } from "../resume-editor/source-document-to-editable.js";
import type { AdaptedResumeSkills, ResumeAdaptationResult } from "./types.js";

type ExperienceItem = ResumeAdaptationResult["adaptedResume"]["experience"][number];
type CandidateGender = "female" | "male" | "unknown";

type SupportContext = {
  sourceText: string;
  sourceTextKey: string;
  originalSkills: string[];
  gender: CandidateGender;
};

const stopWords = new Set([
  "и",
  "в",
  "на",
  "с",
  "по",
  "для",
  "что",
  "как",
  "это",
  "через",
  "без",
  "при",
  "от",
  "до",
]);

const protectedClaims = [
  "After Effects",
  "Premiere Pro",
  "VN",
  "Midjourney",
  "Runway",
  "Pika",
  "Sora",
  "Telegram",
  "VK",
  "ВКонтакте",
  "Instagram",
  "Инстаграм",
  "Shorts",
];

const unsupportedSkillSpecifics: Array<{ pattern: RegExp; support: RegExp }> = [
  { pattern: /коротк.*динамичн|динамичн.*коротк|динамичн.*видео/iu, support: /коротк|динамичн/iu },
  { pattern: /цветокоррекц/iu, support: /цветокоррекц/iu },
  { pattern: /субтитр/iu, support: /субтитр/iu },
  {
    pattern: /звуков|работа\s+со\s+звуком|работа\s+с\s+звуком/iu,
    support: /звуков|работа\s+со\s+звуком|работа\s+с\s+звуком/iu,
  },
  { pattern: /динамичн.*переход|смен[аыой]+\s+кадр/iu, support: /динамичн.*переход|смен[аыой]+\s+кадр/iu },
  { pattern: /блогер/iu, support: /блогер/iu },
  { pattern: /telegram|vk|вконтакте|instagram|инстаграм/iu, support: /telegram|vk|вконтакте|instagram|инстаграм/iu },
  { pattern: /shorts|средн.*видео/iu, support: /shorts|средн.*видео/iu },
  { pattern: /телефон|камера|ракурс|стабилизац|свет/iu, support: /телефон|камера|ракурс|стабилизац|свет/iu },
];

const feminineVerbPairs: Array<[RegExp, string]> = [
  [/\bОсуществлял\b/giu, "Осуществляла"],
  [/\bосуществлял\b/giu, "осуществляла"],
  [/\bРазрабатывал\b/giu, "Разрабатывала"],
  [/\bразрабатывал\b/giu, "разрабатывала"],
  [/\bвел\b/giu, "вела"],
  [/\bвёл\b/giu, "вела"],
  [/\bСоздавал\b/giu, "Создавала"],
  [/\bсоздавал\b/giu, "создавала"],
  [/\bМонтировал\b/giu, "Монтировала"],
  [/\bмонтировал\b/giu, "монтировала"],
  [/\bГенерировал\b/giu, "Генерировала"],
  [/\bгенерировал\b/giu, "генерировала"],
  [/\bВзаимодействовал\b/giu, "Взаимодействовала"],
  [/\bвзаимодействовал\b/giu, "взаимодействовала"],
  [/\bАнализировал\b/giu, "Анализировала"],
  [/\bанализировал\b/giu, "анализировала"],
  [/\bВыявлял\b/giu, "Выявляла"],
  [/\bвыявлял\b/giu, "выявляла"],
  [/\bФормировал\b/giu, "Формировала"],
  [/\bформировал\b/giu, "формировала"],
  [/\bЗапускал\b/giu, "Запускала"],
  [/\bзапускал\b/giu, "запускала"],
  [/\bПодбирал\b/giu, "Подбирала"],
  [/\bподбирал\b/giu, "подбирала"],
  [/\bПисал\b/giu, "Писала"],
  [/\bписал\b/giu, "писала"],
  [/\bОрганизовывал\b/giu, "Организовывала"],
  [/\bорганизовывал\b/giu, "организовывала"],
  [/\bСнимал\b/giu, "Снимала"],
  [/\bснимал\b/giu, "снимала"],
  [/\bИспользовал\b/giu, "Использовала"],
  [/\bиспользовал\b/giu, "использовала"],
  [/\bОформлял\b/giu, "Оформляла"],
  [/\bоформлял\b/giu, "оформляла"],
  [/\bВерстал\b/giu, "Верстала"],
  [/\bверстал\b/giu, "верстала"],
  [/\bКоммуницировал\b/giu, "Коммуницировала"],
  [/\bкоммуницировал\b/giu, "коммуницировала"],
  [/\bПоддерживал\b/giu, "Поддерживала"],
  [/\bподдерживал\b/giu, "поддерживала"],
  [/\bКонтролировал\b/giu, "Контролировала"],
  [/\bконтролировал\b/giu, "контролировала"],
  [/\bСобирал\b/giu, "Собирала"],
  [/\bсобирал\b/giu, "собирала"],
  [/\bПланировал\b/giu, "Планировала"],
  [/\bпланировал\b/giu, "планировала"],
  [/\bАдаптировал\b/giu, "Адаптировала"],
  [/\bадаптировал\b/giu, "адаптировала"],
  [/\bУточнял\b/giu, "Уточняла"],
  [/\bуточнял\b/giu, "уточняла"],
  [/\bГотовил\b/giu, "Готовила"],
  [/\bготовил\b/giu, "готовила"],
  [/\bПрорабатывал\b/giu, "Прорабатывала"],
  [/\bпрорабатывал\b/giu, "прорабатывала"],
  [/\bПереупаковывал\b/giu, "Переупаковывала"],
  [/\bпереупаковывал\b/giu, "переупаковывала"],
  [/\bОбрабатывал\b/giu, "Обрабатывала"],
  [/\bобрабатывал\b/giu, "обрабатывала"],
  [/\bОбеспечивал\b/giu, "Обеспечивала"],
  [/\bобеспечивал\b/giu, "обеспечивала"],
];

function clean(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() || "";
}

function key(value: string) {
  return clean(value).toLowerCase().replace(/[^a-zа-яё0-9+#.]+/giu, "");
}

function normalizeToken(token: string) {
  const normalized = token.toLowerCase();
  if (normalized.length <= 5) return normalized;

  return normalized.slice(0, 5);
}

function tokens(value: string) {
  return clean(value)
    .toLowerCase()
    .split(/[^a-zа-яё0-9+#.]+/giu)
    .map(normalizeToken)
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function similarity(a: string, b: string) {
  const first = new Set(tokens(a));
  const second = new Set(tokens(b));
  if (!first.size || !second.size) return 0;
  const intersection = [...first].filter((token) => second.has(token)).length;
  return intersection / Math.min(first.size, second.size);
}

function isSimilar(a: string, b: string) {
  return similarity(a, b) >= 0.42;
}

function isNearDuplicate(a: string, b: string) {
  return similarity(a, b) >= 0.82;
}

function detectCandidateGender(sourceDocument: SourceResumeDocument): CandidateGender {
  const gender = clean(sourceDocument.personal.gender).toLowerCase();
  if (/жен|female|woman/u.test(gender)) return "female";
  if (/муж|male|man/u.test(gender)) return "male";

  const fullName = clean(sourceDocument.personal.fullName).toLowerCase();
  if (/(?:овна|евна|ична|инична)\b/u.test(fullName)) return "female";
  if (/(?:ович|евич)\b/u.test(fullName)) return "male";
  if (/\b[а-яё]+(?:ова|ева|ёва|ина|ая)\b/u.test(fullName)) return "female";
  if (/\b[а-яё]+(?:ов|ев|ёв|ин|ий|ый)\b/u.test(fullName)) return "male";

  return "unknown";
}

function applyGenderInflection(value: string, gender: CandidateGender) {
  let result = value;
  if (gender === "female") {
    for (const [pattern, replacement] of feminineVerbPairs) {
      result = result.replace(pattern, replacement);
    }

    result = result
      .replace(/\bПрофессиональный\s+SMM-специалист\b/giu, "SMM-специалист")
      .replace(/\bпрофессиональный\s+SMM-специалист\b/giu, "SMM-специалист");
  }

  return result;
}

function extractSalary(value?: string | null) {
  const text = clean(value);
  const match = text.match(
    /\d[\d\s]{1,14}\s*(?:₽|руб\.?|RUB)(?:\s*(?:на руки|net|gross|до вычета налогов|до вычета|после вычета))?/iu
  );

  return match?.[0] ? clean(match[0]) : null;
}

function isSalaryLine(value?: string | null) {
  const text = clean(value);
  const salary = extractSalary(text);

  if (!text || !salary) return false;

  return text.replace(/[.,;:]$/u, "").length <= salary.length + 14;
}

function unique(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const normalized = clean(value);
    const itemKey = key(normalized);
    if (!normalized || seen.has(itemKey)) continue;
    seen.add(itemKey);
    result.push(normalized);
  }
  return result;
}

function isAiRelated(value: string) {
  return /нейросет|искусственн\s+интеллект|\b(?:ai|ии)\b|chatgpt|perplexity|krea|kling|google\s+ai/iu.test(value);
}

function extractSupportedAiTools(context: SupportContext) {
  const sourceText = normalizeResumeText(context.sourceText);
  const tools: Array<[string, RegExp]> = [
    ["ChatGPT", /chatgpt/iu],
    ["Perplexity", /perplexity/iu],
    ["Krea", /krea/iu],
    ["Kling AI", /kling\s*ai|\bkling\b/iu],
    ["Google AI Studio", /google\s+ai\s+studio/iu],
  ];

  return tools.filter(([, pattern]) => pattern.test(sourceText)).map(([name]) => name);
}

function collectExperienceSalary(items: ExperienceItem[]) {
  for (const item of items) {
    const salary = extractSalary(item.position) || extractSalary(item.focus);
    if (salary && (isSalaryLine(item.position) || isSalaryLine(item.focus))) {
      return salary;
    }

    const bulletSalary = item.adaptedBullets
      .map((bullet) => (isSalaryLine(bullet) ? extractSalary(bullet) : null))
      .find(Boolean);

    if (bulletSalary) return bulletSalary;
  }

  return null;
}

function resolvePosition(original: ExperienceItem, adapted: ExperienceItem | null) {
  const originalPosition = clean(original.position);
  const adaptedPosition = clean(adapted?.position);

  if (isSalaryLine(originalPosition)) {
    return adaptedPosition && !isSalaryLine(adaptedPosition) ? adaptedPosition : null;
  }

  return originalPosition || (adaptedPosition && !isSalaryLine(adaptedPosition) ? adaptedPosition : null);
}

function findAdapted(items: ExperienceItem[], sourceIndex: number, fallbackIndex: number) {
  return items.find((item) => item.sourceIndex === sourceIndex) || items[fallbackIndex] || null;
}

function isSupportedClaim(value: string, context: SupportContext) {
  const itemKey = key(value);

  if (!itemKey) return false;
  if (context.sourceTextKey.includes(itemKey)) return true;
  if (isAiRelated(value) && isAiRelated(context.sourceText)) return true;

  const valueTokens = tokens(value);
  const supportedTokenCount = valueTokens.filter((token) => context.sourceTextKey.includes(token)).length;
  if (valueTokens.length > 0 && supportedTokenCount / valueTokens.length >= 0.65) {
    return true;
  }

  return context.originalSkills.some((skill) => key(skill) === itemKey || isSimilar(skill, value));
}

function isDanglingClaimText(value: string) {
  const text = clean(value).replace(/[.,;:]+$/u, "");

  return (
    !text ||
    /^(?:работа|навык|навыки|опыт|владение|знание)$/iu.test(text) ||
    /^(?:работа|навык|навыки|опыт|владение|знание)\s+(?:в|с|со|на|для)$/iu.test(text) ||
    /^(?:создание|разработка|ведение|подготовка|монтаж)\s*$/iu.test(text)
  );
}

function cleanupUnsupportedClaimText(value: string) {
  return value
    .replace(/\((?:\s*[,/;]?\s*)+\)/g, "")
    .replace(/\(\s*\)/g, "")
    .replace(/(?:,\s*){2,}/g, ", ")
    .replace(/,\s*([).])/g, "$1")
    .replace(/\s+,/g, ",")
    .replace(/(?:включая|в том числе)\s*[,.]?\s*([.)])/giu, "$1")
    .replace(/\b(?:в|на|для|через|с помощью|с)\s*[,.]/giu, ".")
    .replace(/\b(?:включая|в том числе)\s*$/giu, "")
    .replace(/\b(?:в|на|для|через|с помощью|с|со)\s*$/giu, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\./g, ".")
    .replace(/\.{2,}/g, ".")
    .trim();
}

function sanitizeUnsupportedClaims(value: string, context: SupportContext) {
  let result = clean(value);

  for (const claim of protectedClaims) {
    if (isSupportedClaim(claim, context)) continue;

    result = result.replace(new RegExp(`\\b${escapeRegExp(claim)}\\b`, "giu"), "");
  }

  const cleaned = cleanupUnsupportedClaimText(result);
  return isDanglingClaimText(cleaned) ? "" : cleaned;
}

function sanitizeResumeText(value: string, context: SupportContext) {
  return applyGenderInflection(sanitizeUnsupportedClaims(value, context), context.gender);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeResumeText(value: string) {
  return clean(value)
    .replace(/^\*?\s*ПОРТФОЛИО\s*$/giu, "Портфолио")
    .replace(/\bРИЛС\b/giu, "Reels")
    .replace(/сьемк/giu, "съёмк")
    .replace(/съемк/giu, "съёмк")
    .replace(/Видеосъемка/giu, "Видеосъёмка")
    .replace(/некнейм/giu, "никнейм")
    .replace(/шапка профиля\+/giu, "шапка профиля +")
    .replace(/,stories/giu, ", stories")
    .replace(/Abode Photoshop/giu, "Adobe Photoshop")
    .replace(/Google AI Stutio/giu, "Google AI Studio")
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function normalizeSkillText(value: string, context: SupportContext) {
  const text = normalizeResumeText(value);

  if (/создание\s+видеоконтента|монтаж\s+коротк|reels/i.test(text)) {
    return "Reels-контент: сценарии, съёмка и монтаж";
  }

  if (/генерац.*нейросет|работа\s+с\s+(?:ии|ai)|нейросет/i.test(text)) {
    const tools = extractSupportedAiTools(context);
    return tools.length ? `ИИ-инструменты: ${tools.join(", ")}` : "Работа с ИИ-инструментами";
  }

  if (/photoshop|figma|canva/i.test(text)) {
    const tools = ["Canva", "Figma", "Adobe Photoshop"].filter((tool) =>
      new RegExp(escapeRegExp(tool.replace("Adobe ", "")), "iu").test(context.sourceText)
    );
    return tools.length ? tools.join(" / ") : text;
  }

  if (/разработка\s+сценар/i.test(text)) return "Сценарии для Reels и публикаций";
  if (/разработка\s+дизайна|дизайн\s+постов|сторис/i.test(text)) return "Дизайн постов, stories, обложек и инфографики";
  if (/взаимодействие\s+с\s+аудитор/i.test(text)) return "Коммуникация с подписчиками";

  return text;
}

function polishBullet(value: string, context?: SupportContext) {
  const text = normalizeResumeText(value);
  const lower = text.toLowerCase();
  const finish = (result: string) => applyGenderInflection(result, context?.gender || "unknown");

  if (/^анализ(?:ировал)?\s+конкурент/u.test(lower)) {
    return finish("Анализировал конкурентную среду и контент-подходы, чтобы уточнять рубрики, визуальный стиль и подачу бренда");
  }

  if (/формирован|формировал.*един.*стил/u.test(lower)) {
    return finish("Формировал единый визуальный стиль аккаунта, передающий атмосферу бренда и поддерживающий цельную подачу в ленте");
  }

  if (/создан.*аккаунт.*с нуля|создавал.*аккаунт.*с нуля|запускал.*аккаунт/u.test(lower)) {
    return finish("Запускал аккаунт с нуля: подбирал позиционирование, структуру профиля, визуальную подачу и первые рубрики");
  }

  if (/переупаков/u.test(lower)) {
    return finish("Переупаковывал аккаунт: обновлял визуальную подачу, структуру профиля и оформление ключевых разделов");
  }

  if (/контент[- ]план/u.test(lower)) {
    return finish("Разрабатывал контент-план на 14 дней / 1 месяц с учётом рубрик, визуальной логики, тем публикаций и регулярности выхода контента");
  }

  if (/reels|рилс/u.test(lower)) {
    return finish("Создавал Reels-контент полного цикла: подбирал референсы, писал сценарии, организовывал съёмки и монтировал ролики под задачи бренда");
  }

  if (/написан.*пост|писал.*пост/u.test(lower)) {
    return finish("Писал посты с учётом тональности бренда, задачи публикации и вовлечения аудитории");
  }

  if (/никнейм|шапк.*профил|аватар/u.test(lower)) {
    return finish("Прорабатывал упаковку профиля: подбирал никнейм, оформлял шапку аккаунта и аватар под позиционирование бренда");
  }

  if (/stories|сторис/u.test(lower)) {
    return finish("Вёл stories: готовил регулярные форматы, визуальные материалы и коммуникационные сценарии для поддержания активности аккаунта");
  }

  if (/обработ.*фото|инфограф/u.test(lower)) {
    return finish("Обрабатывал фотографии и создавал инфографику для афиш, stories и постов в едином визуальном стиле");
  }

  if (/работ.*ии|нейросет|chatgpt|perplexity|krea|kling/u.test(lower)) {
    const tools = context ? extractSupportedAiTools(context) : [];
    const toolsText = tools.length ? ` (${tools.join(", ")})` : "";
    return finish(`Использовал ИИ-инструменты${toolsText} для подготовки визуальных идей, текстовых материалов и контентных гипотез`);
  }

  if (/актуальн/u.test(lower)) {
    return finish("Оформлял актуальные разделы профиля: продумывал названия, обложки и визуальную структуру для быстрого доступа к ключевой информации");
  }

  if (/верстк.*меню|дизайн.*меню/u.test(lower)) {
    return finish("Верстал меню и разрабатывал его дизайн, сохраняя единый визуальный стиль бренда");
  }

  if (/коммуникац|подписчик/u.test(lower)) {
    return finish("Коммуницировал с подписчиками, поддерживал обратную связь и вовлечение аудитории в аккаунте");
  }

  if (/подготовк.*тем|рубрик|сценар/u.test(lower)) {
    return finish("Готовил темы, рубрики и сценарии публикаций: искал идеи, формулировал тезисы и подбирал референсы");
  }

  if (/координац.*контент|планирован.*срок|контроль публикац/u.test(lower)) {
    return finish("Координировал выпуск контента: планировал сроки, собирал материалы и контролировал публикации по графику");
  }

  if (/визуальн.*оформ|обложк|превью/u.test(lower)) {
    return finish("Создавал визуальное оформление для постов: обложки, превью и единый стиль ленты");
  }

  if (/видеосъ[её]мк|видео.*съ[её]мк|монтаж видео|обработка видео/u.test(lower)) {
    return finish("Снимал и монтировал видеоконтент для коротких форматов, адаптируя визуальную подачу под задачи публикации");
  }

  return finish(text);
}

function normalizeNotAddedValue(value: string) {
  const normalized = normalizeResumeText(value)
    .replace(/^Нет\s+подтвержд[ёе]нного\s+опыта:\s*/iu, "")
    .replace(/^Нет\s+подтвержд[ёе]нного\s+опыта\s+работы\s+(?:с|со|в)\s+/iu, "")
    .replace(/^Нет\s+опыта\s+работы\s+(?:с|со|в)\s+/iu, "")
    .replace(/^Опыт\s+работы\s+(?:с|со|в)\s+/iu, "")
    .replace(/^Работа\s+(?:с|со|в)\s+/iu, "")
    .replace(/^Выдумывание\s+опыта\s+работы\s+(?:с|со|в)\s+/iu, "")
    .replace(/^Умение\s+создавать\s+/iu, "")
    .replace(/[.,;:]+$/u, "");

  if (/telegram|vk|вконтакте|instagram|инстаграм/i.test(normalized)) return "Telegram / VK / Instagram";
  if (/after\s*effects|после\s*effects/i.test(normalized)) return "After Effects";
  if (/premiere\s*pro/i.test(normalized)) return "Premiere Pro";
  if (/^vn$/i.test(normalized)) return "VN";
  if (/блогер/i.test(normalized)) return "Работа с блогерами";
  if (/shorts|средн.*видео/i.test(normalized)) return "Shorts и средние видео";
  if (/телефон|камера|ракурс|стабилизац|свет/i.test(normalized)) return "Съёмка на телефон или камеру с учётом света, ракурсов и стабилизации";
  if (/коротк.*динамичн.*видео|динамичн.*коротк.*видео/i.test(normalized)) {
    return "Короткие динамичные видео с субтитрами, музыкой, звуковыми эффектами и сменой кадров";
  }
  if (/цветокоррекц|звук|субтитр|динамичн.*переход|смен[аыой]+\s+кадр/i.test(normalized)) {
    return "Цветокоррекция, звук, субтитры и динамичные переходы";
  }

  return normalized;
}

function normalizeNotAdded(items: string[]) {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const normalized = normalizeNotAddedValue(item);
    const itemKey = key(normalized);
    if (!normalized || isDanglingClaimText(normalized) || seen.has(itemKey)) continue;
    seen.add(itemKey);
    result.push(normalized);
  }

  return result;
}

function mergeBullets(original: string[], adapted: string[], context: SupportContext) {
  const originalItems = unique(original)
    .filter((item) => !isSalaryLine(item))
    .map((item) => polishBullet(item, context));
  const adaptedItems = unique(adapted)
    .filter((item) => !isSalaryLine(item))
    .map((item) => sanitizeResumeText(item, context))
    .filter(Boolean)
    .map((item) => polishBullet(item, context));

  if (!originalItems.length) return unique(adaptedItems);
  if (!adaptedItems.length) return unique(originalItems);

  const targetCount = Math.min(Math.max(originalItems.length, adaptedItems.length), 16);
  const result = [...adaptedItems];
  const seen = new Set(result.map(key));

  for (const bullet of originalItems) {
    if (result.length >= targetCount) break;
    const bulletKey = key(bullet);
    if (seen.has(bulletKey) || result.some((item) => isNearDuplicate(item, bullet))) continue;
    seen.add(bulletKey);
    result.push(bullet);
  }

  return unique(result).slice(0, targetCount);
}

function mergeFocus(originalFocus: string | null, adaptedFocus: string | null | undefined, context: SupportContext) {
  const adapted = sanitizeResumeText(clean(adaptedFocus), context);
  if (adapted && !isSalaryLine(adapted)) return adapted;
  return unique(originalFocus?.split("\n") || [])
    .filter((item) => !isSalaryLine(item))
    .map((item) => polishBullet(item, context))
    .join("\n") || null;
}

function mergePreservedFacts(original: ExperienceItem, adapted: ExperienceItem | null) {
  return unique([...(adapted?.preservedFacts || []), ...original.adaptedBullets])
    .filter((item) => !isSalaryLine(item))
    .map(normalizeResumeText)
    .slice(0, 16);
}

function mergeExperienceItem(
  original: ExperienceItem,
  adapted: ExperienceItem | null,
  context: SupportContext
): ExperienceItem {
  const adaptedBullets = adapted?.adaptedBullets || [];
  return {
    sourceIndex: original.sourceIndex,
    company: original.company,
    companyUrl: original.companyUrl,
    position: resolvePosition(original, adapted),
    dates: original.dates,
    adaptedBullets: mergeBullets(original.adaptedBullets, adaptedBullets, context),
    focus: mergeFocus(original.focus, adapted?.focus, context),
    preservedFacts: mergePreservedFacts(original, adapted),
    warnings: adapted?.warnings || [],
  };
}

function splitSkillLine(value: string) {
  return clean(value)
    .replace(/([а-яёa-z])\s+([А-ЯЁA-Z])/g, "$1|$2")
    .split(/[|,;•]+/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && !/русский|родной/i.test(item));
}

function createOriginalSkillPhrases(original: AdaptedResumeSkills) {
  return unique([...original.primary, ...original.secondary].flatMap(splitSkillLine));
}

function hasUnsupportedSpecificSkill(value: string, context: SupportContext) {
  return unsupportedSkillSpecifics.some(
    ({ pattern, support }) => pattern.test(value) && !support.test(context.sourceText)
  );
}

function findSupportedSkill(value: string, context: SupportContext) {
  const normalized = normalizeSkillText(sanitizeResumeText(value, context), context);
  if (!normalized || isDanglingClaimText(normalized)) return null;
  if (hasUnsupportedSpecificSkill(value, context) || hasUnsupportedSpecificSkill(normalized, context)) return null;

  const valueKey = key(normalized);
  const exact = context.originalSkills.find((skill) => key(skill) === valueKey);
  if (exact) return normalized;

  if (isSupportedClaim(normalized, context)) return normalized;

  return context.originalSkills.some((skill) => isSimilar(skill, normalized)) ? normalized : null;
}

function mergeSkills(original: AdaptedResumeSkills, adapted: AdaptedResumeSkills, context: SupportContext) {
  const addSupported = (items: string[]) =>
    unique(items)
      .map((item) => findSupportedSkill(item, context))
      .filter((item): item is string => Boolean(item));

  const primary = unique(addSupported([...adapted.primary, ...adapted.secondary]));
  const used = new Set(primary.map(key));
  const secondary = context.originalSkills.filter((skill) => !used.has(key(skill)));

  return {
    primary: primary.length ? primary : unique(original.primary),
    secondary,
    deprioritized: unique(adapted.deprioritized).filter((item) => Boolean(findSupportedSkill(item, context))),
    notAdded: normalizeNotAdded(adapted.notAdded),
  };
}

function isUsefulAdditionalInfo(value: string) {
  return (
    /портфолио|https?:\/\//iu.test(value) ||
    /canva|figma|photoshop|capcut|bazaart|pocket/iu.test(value) ||
    /chatgpt|perplexity|krea|kling|google\s+ai|нейросет|\bai\b|\bии\b/iu.test(value)
  );
}

function normalizeAdditionalInfoItem(value: string, context: SupportContext) {
  const normalized = normalizeResumeText(value);
  const sanitized = sanitizeResumeText(normalized, context);

  if (!sanitized || isDanglingClaimText(sanitized) || !isUsefulAdditionalInfo(sanitized)) return null;
  return sanitized;
}

function mergeAdditionalInfo(original: string[], adapted: string[], context: SupportContext) {
  const adaptedItems = adapted
    .map((item) => normalizeAdditionalInfoItem(item, context))
    .filter((item): item is string => Boolean(item));
  const originalUsefulItems = original
    .filter(isUsefulAdditionalInfo)
    .map((item) => normalizeAdditionalInfoItem(item, context))
    .filter((item): item is string => Boolean(item));

  return unique([...adaptedItems, ...originalUsefulItems]).slice(0, 12);
}

function collectText(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectText);
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(collectText);
  }

  return [];
}

function createSupportContext(original: ResumeAdaptationResult, sourceDocument: SourceResumeDocument): SupportContext {
  const originalSkills = createOriginalSkillPhrases(original.adaptedResume.skills);
  const sourceText = collectText(original).join("\n");

  return {
    sourceText,
    sourceTextKey: key(sourceText),
    originalSkills,
    gender: detectCandidateGender(sourceDocument),
  };
}

function filterSupportedKeywords(items: string[], context: SupportContext) {
  return unique(items)
    .map((item) => normalizeSkillText(item, context))
    .filter((item) => isSupportedClaim(item, context) && !hasUnsupportedSpecificSkill(item, context));
}

function normalizeHeadline(value: string | null | undefined, context: SupportContext) {
  const sanitized = sanitizeResumeText(clean(value), context);
  return sanitized.replace(/^Профессиональный\s+/iu, "").replace(/^Профессиональная\s+/iu, "");
}

function resolveTargetTitle(params: {
  sourceTitle?: string | null;
  adaptedTitle?: string | null;
  headline?: string | null;
  context: SupportContext;
}) {
  const sourceTitle = clean(params.sourceTitle);
  const adaptedTitle = normalizeHeadline(params.adaptedTitle, params.context);
  const headline = normalizeHeadline(params.headline, params.context);

  if (headline && headline !== sourceTitle) return headline;
  if (adaptedTitle) return adaptedTitle;
  return sourceTitle || null;
}

export function applySourceResumeStructure(params: {
  adaptation: ResumeAdaptationResult;
  sourceDocument: SourceResumeDocument;
}): ResumeAdaptationResult {
  const original = sourceDocumentToEditableResume(params.sourceDocument).resumeJson;
  const adapted = params.adaptation;
  const target = original.target;
  const context = createSupportContext(original, params.sourceDocument);
  const sourceSalary = collectExperienceSalary(original.adaptedResume.experience);
  const experience = original.adaptedResume.experience.map((item, index) =>
    mergeExperienceItem(item, findAdapted(adapted.adaptedResume.experience, item.sourceIndex, index), context)
  );
  const headline = normalizeHeadline(adapted.adaptedResume.headline, context);

  return {
    ...adapted,
    target: {
      title: resolveTargetTitle({
        sourceTitle: target.title,
        adaptedTitle: adapted.target.title,
        headline,
        context,
      }),
      company: null,
      seniority: target.seniority || null,
      salary: target.salary || sourceSalary || null,
      specializations: target.specializations || [],
      employment: target.employment || null,
      schedule: target.schedule || null,
      workFormat: target.workFormat || null,
      commuteTime: target.commuteTime || null,
      keywordsUsed: filterSupportedKeywords(adapted.target.keywordsUsed, context),
    },
    adaptedResume: {
      ...adapted.adaptedResume,
      headline,
      summary: sanitizeResumeText(adapted.adaptedResume.summary, context),
      experience,
      skills: mergeSkills(original.adaptedResume.skills, adapted.adaptedResume.skills, context),
      education: original.adaptedResume.education,
      additionalInfo: mergeAdditionalInfo(
        original.adaptedResume.additionalInfo,
        adapted.adaptedResume.additionalInfo,
        context
      ),
    },
  };
}
