import { parseConfirmedFact } from "./parsing.js";
import { stems } from "./text-matching.js";
import type { ExperienceCompanyRef } from "./types.js";

function normalizeCompanyMention(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/giu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findMentionedCompany(
  value: string,
  companies: ExperienceCompanyRef[]
) {
  const text = ` ${normalizeCompanyMention(value)} `;
  const exact = companies
    .map((company) => ({ company, key: normalizeCompanyMention(company.name) }))
    .filter(({ key }) => key && text.includes(` ${key} `))
    .sort((left, right) => right.key.length - left.key.length);
  if (exact[0]) return exact[0].company;
  const valueStems = new Set(stems(value));
  const candidates = companies
    .map((company) => ({ company, companyStems: stems(company.name) }))
    .filter(({ companyStems }) =>
      companyStems.length >= 2 && companyStems.every((stem) => valueStems.has(stem)))
    .sort((left, right) => right.companyStems.length - left.companyStems.length);
  return candidates[0]?.company || null;
}

export function findAnchoredCompany(
  label: string,
  companies: ExperienceCompanyRef[]
) {
  const segmentStems = new Set(stems(label.slice(0, 80)));
  let best: ExperienceCompanyRef | null = null;
  let bestStemCount = 0;
  for (const company of companies) {
    const companyStems = stems(company.name);
    if (
      companyStems.length &&
      companyStems.every((stem) => segmentStems.has(stem)) &&
      companyStems.length > bestStemCount
    ) {
      best = company;
      bestStemCount = companyStems.length;
    }
  }
  return best;
}

export function enrichConfirmedFactsWithSources(
  confirmedFacts: string[] | undefined,
  companies: ExperienceCompanyRef[]
) {
  if (!confirmedFacts?.length || !companies.length) return confirmedFacts || [];
  return confirmedFacts.map((fact) => {
    const parsed = parseConfirmedFact(fact);
    if (parsed.refusal || parsed.sourceIndex !== null || parsed.kind !== "experience") return fact;
    const company =
      findAnchoredCompany(parsed.answer, companies) ||
      findMentionedCompany(parsed.question, companies);
    if (!company) return fact;
    const safeName = company.name.replace(/[\]]/g, "");
    const sourceTag = `[SOURCE sourceIndex=${company.sourceIndex}; company=${safeName}]`;
    const firstTagEnd = fact.indexOf("]");
    if (firstTagEnd < 0) return `${sourceTag} ${fact}`;
    return `${fact.slice(0, firstTagEnd + 1)} ${sourceTag}${fact.slice(firstTagEnd + 1)}`;
  });
}
