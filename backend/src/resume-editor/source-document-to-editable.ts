import type { ResumeTextBlock, SourceResumeDocument } from "../resume-document/types.js";
import type { EditableResumeContacts, EditableResumeJson } from "./types.js";

type ExperienceItem = SourceResumeDocument["experience"]["items"][number];

type SplitBlocks = { focus: string[]; bullets: string[] };

export function sourceDocumentToEditableResume(document: SourceResumeDocument) {
  return { contacts: documentToContacts(document), resumeJson: documentToResumeJson(document) };
}

function documentToContacts(document: SourceResumeDocument): EditableResumeContacts {
  const personal = document.personal;
  return {
    fullName: text(personal.fullName),
    gender: text(personal.gender),
    age: text(personal.age),
    birthDate: text(personal.birthDate),
    phone: text(personal.phone || document.additional.phone),
    email: text(personal.email || document.additional.email),
    city: text(personal.city),
    citizenship: text(personal.citizenship),
    workPermit: text(personal.workPermit),
    relocation: text(personal.relocation),
    businessTrips: text(personal.businessTrips),
  };
}

function resolveOriginalTitle(document: SourceResumeDocument) {
  return (
    text(document.target.title) ||
    document.experience.items
      .map((item) => resolveRawPosition(item) || text(item.position))
      .find(Boolean) ||
    "Резюме"
  );
}

function documentToResumeJson(document: SourceResumeDocument): EditableResumeJson {
  const headline = resolveOriginalTitle(document);
  return {
    target: {
      title: headline === "Резюме" ? null : headline,
      company: null,
      seniority: null,
      salary: text(document.target.salary) || null,
      specializations: cleanList(document.target.specializations),
      employment: text(document.target.employment) || null,
      schedule: text(document.target.schedule) || null,
      workFormat: text(document.target.workFormat) || null,
      commuteTime: text(document.target.commuteTime) || null,
      keywordsUsed: [],
    },
    adaptedResume: {
      headline,
      summary: document.additional.about.join("\n"),
      skills: {
        primary: cleanList(document.skills.items),
        secondary: document.skills.languages.map(formatLanguage).filter(Boolean),
        deprioritized: [],
        notAdded: [],
      },
      experience: document.experience.items.map(toExperienceItem),
      education: {
        policy: document.education.items.length || document.education.level ? "unchanged" : "not_found",
        notes: educationToNotes(document),
      },
      additionalInfo: [],
    },
    changes: [],
    warnings: document.diagnostics.warnings,
    forbiddenClaims: [],
  };
}

function toExperienceItem(item: ExperienceItem, index: number) {
  const split = splitExperienceBlocks(item.blocks);
  const position = resolveRawPosition(item) || text(item.position);
  const constants = resolveExperienceConstants(item, position);
  const blockedLines = [position, ...constants.metaLines];
  const filteredFocus = removeExactLines(split.focus, blockedLines);
  const filteredBullets = removeExactLines(split.bullets, blockedLines);
  const metadataText = constants.metaLines.join("\n");

  return {
    sourceIndex: Number.isFinite(item.sourceIndex) ? item.sourceIndex : index,
    company: constants.company || text(item.company.name) || null,
    companyUrl: metadataText || text(item.company.url) || null,
    position: position || null,
    dates: formatDates(item.dates),
    adaptedBullets: filteredBullets,
    focus: createFocus(filteredFocus),
    preservedFacts: filteredBullets.slice(0, 16),
    warnings: [],
  };
}

function educationToNotes(document: SourceResumeDocument) {
  const items = document.education.items.map((item) =>
    [item.year, item.institution, item.faculty, item.specialization].map(text).filter(Boolean).join(" — ")
  );
  return cleanList([document.education.level || "", ...items]);
}

function splitExperienceBlocks(blocks: ResumeTextBlock[]): SplitBlocks {
  const result: SplitBlocks = { focus: [], bullets: [] };
  let isBulletMode = false;

  for (const block of blocks) {
    if (block.type === "sectionTitle") {
      if (isBulletSection(block.title)) isBulletMode = true;
      continue;
    }

    const value = formatBlock(block);
    if (!value) continue;

    if (!isBulletMode && isFocusBlock(block, result.focus.length)) {
      result.focus.push(value);
      continue;
    }

    isBulletMode = true;
    result.bullets.push(value);
  }

  return { focus: cleanList(result.focus).slice(0, 4), bullets: cleanList(result.bullets) };
}

function isBulletSection(title: string) {
  return /достиж|задач|обязан|пример|ключев|опыт работы/i.test(title);
}

function isFocusBlock(block: ResumeTextBlock, focusCount: number) {
  if (focusCount >= 4) return false;
  if (block.type === "stack") return /стек|технолог/i.test(block.label);
  return block.type === "paragraph" && !/^[-—–•*]/u.test(block.text);
}

function formatBlock(block: ResumeTextBlock) {
  if (block.type === "sectionTitle") return "";
  if (block.type === "stack") return `${block.label}: ${block.items.join(", ")}`;
  return block.text;
}

function createFocus(focus: string[]) {
  return cleanList(focus).join("\n") || null;
}

function formatDates(item: ExperienceItem["dates"]) {
  return [item.start, item.end].map(text).filter(Boolean).join(" — ") || null;
}

function rawExperienceLines(item: ExperienceItem) {
  const dateLineCount = item.dates.raw.length;
  return item.raw.slice(dateLineCount).map(text).filter(Boolean);
}

function normalizeBulletPrefix(value: string) {
  return text(value).replace(/^[-—–•*]\s*/u, "");
}

function isKnownCity(value: string) {
  return [
    "москва",
    "санкт-петербург",
    "краснодар",
    "воронеж",
    "екатеринбург",
    "томск",
    "усть-лабинск",
    "ульяновск",
    "симферополь",
  ].includes(text(value).toLowerCase());
}

function looksLikeUrl(value: string) {
  return /^https?:\/\//i.test(value) || /^[a-zа-яё0-9.-]+\.[a-zа-яё]{2,}(?:\/.*)?$/i.test(value);
}

function isServiceLine(value: string) {
  return /резюме\s+обновлено|предпочитаемый\s+способ\s+связи/i.test(value);
}

function isLikelyIndustryLine(value: string) {
  const line = normalizeBulletPrefix(value);
  return /информационные\s+технологии|системная\s+интеграция|интернет|разработка\s+программного\s+обеспечения|финансовый\s+сектор|банк|ритейл|производство|образование|медицина|строительство|маркетинг|реклама|консалтинг/i.test(line);
}

function isLikelyPositionLine(value: string) {
  const line = text(value);
  if (!line) return false;
  if (/^(?:Компания|Команда|Стек|Технологии|Работал[аи]?\s+над|Примеры задач)\b/i.test(line)) return false;
  if (looksLikeUrl(line)) return false;
  if (/^[-—–•*]/u.test(line)) return false;

  return /(?:developer|разработчик|программист|инженер|designer|дизайнер|manager|менеджер|аналитик|qa|тестировщик|backend|frontend|fullstack|devops|smm|маркетолог)/iu.test(line);
}

function isLikelyCompanyLine(value: string) {
  const line = text(value);
  if (!line || line.length > 80) return false;
  if (isServiceLine(line) || isKnownCity(line) || isLikelyIndustryLine(line)) return false;
  if (looksLikeUrl(line) || isLikelyPositionLine(line)) return false;
  if (/^[-—–•*]/u.test(line)) return false;
  if (/[:]/u.test(line)) return false;
  if (/^(?:Компания|Команда|Стек|Технологии|Работал[аи]?\s+над|Примеры задач|Обязанности|Задачи|Достижения)\b/i.test(line)) return false;
  return /[a-zа-яё0-9]/iu.test(line);
}

function resolveExperienceConstants(item: ExperienceItem, position: string) {
  const lines = rawExperienceLines(item).filter((line) => !isServiceLine(line));
  const positionIndex = lines.findIndex((line) => textKey(line) === textKey(position) || isLikelyPositionLine(line));
  const beforePosition = positionIndex >= 0 ? lines.slice(0, positionIndex) : lines;
  const companyFromHeader = beforePosition.find(isLikelyCompanyLine) || "";
  const trailingCompany = [...lines].reverse().find(isLikelyCompanyLine) || "";
  const company = companyFromHeader || trailingCompany;
  const metaLines = uniquePreserve(
    beforePosition
      .filter((line) => !company || textKey(line) !== textKey(company))
      .filter((line) => isKnownCity(line) || looksLikeUrl(line) || isLikelyIndustryLine(line))
      .map(normalizeBulletPrefix)
  );

  return { company, metaLines };
}

function resolveRawPosition(item: ExperienceItem) {
  const rawPosition = rawExperienceLines(item).find(isLikelyPositionLine);
  const parsedPosition = text(item.position);
  if (rawPosition) return rawPosition;
  return isLikelyPositionLine(parsedPosition) ? parsedPosition : "";
}

function removeExactLines(items: string[], blocked: string[]) {
  const blockedKeys = new Set(blocked.map(textKey).filter(Boolean));
  if (!blockedKeys.size) return items;
  return items.filter((item) => !blockedKeys.has(textKey(item)));
}

function textKey(value: string) {
  return text(value).toLowerCase().replace(/[^a-zа-яё0-9+#]+/giu, "");
}

function uniquePreserve(items: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items.map(text).filter(Boolean)) {
    const key = textKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function formatLanguage(item: SourceResumeDocument["skills"]["languages"][number]) {
  return [item.name, item.level, item.description].map(text).filter(Boolean).join(" — ");
}

function cleanList(items: string[]) {
  const seen = new Set<string>();
  return items.map(text).filter((item) => {
    const key = item.toLowerCase();
    if (!item || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function text(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() || "";
}
