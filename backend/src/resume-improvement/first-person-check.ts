import type { ResumeAdaptationResult } from "../resume-adaptation/types.js";

export type FirstPersonLeak = {
  field: string;
  word: string;
};

// The word list the improvement system prompt forbids in bullets/focus/
// additionalInfo ("не используй первое лицо: я, мой, моя, мы, наш, имею,
// умею...") plus their most common inflections, extended with other
// unambiguous 1st-person-singular-present verbs that show up in practice
// (e.g. "использую" in an AI-tools mention) but weren't literally on that
// list - still a finite, high-confidence set, not an attempt at full
// morphological coverage. Summary is deliberately NOT checked: it is the
// "Обо мне" section and the prompt REQUIRES first-person present tense
// there (mirroring the adaptation flow's summary rules).
const FORBIDDEN_WORDS = [
  "я",
  "мой",
  "моя",
  "моё",
  "мое",
  "моих",
  "моим",
  "моей",
  "мою",
  "мы",
  "нам",
  "нас",
  "нами",
  "наш",
  "наша",
  "наше",
  "нашего",
  "нашей",
  "нашу",
  "нашим",
  "нашими",
  "наших",
  "имею",
  "умею",
  "работаю",
  "специализируюсь",
  "использую",
  "применяю",
  "владею",
  "знаю",
  "занимаюсь",
  "пишу",
  "делаю",
  "стремлюсь",
  "планирую",
  "могу",
];

// \b/\w are ASCII-only, so they never match around Cyrillic letters - use an
// explicit lookaround against the Cyrillic alphabet instead, same trick as
// apply-source-resume-structure.ts.
const CYRILLIC_WORD_CHAR = "а-яёА-ЯЁ0-9";
const notPrecededByCyrillicWord = `(?<![${CYRILLIC_WORD_CHAR}])`;
const notFollowedByCyrillicWord = `(?![${CYRILLIC_WORD_CHAR}])`;

function findForbiddenWord(text: string): string | null {
  for (const word of FORBIDDEN_WORDS) {
    const pattern = new RegExp(
      `${notPrecededByCyrillicWord}${word}${notFollowedByCyrillicWord}`,
      "iu"
    );
    if (pattern.test(text)) return word;
  }
  return null;
}

export function findFirstPersonLeaks(adaptation: ResumeAdaptationResult): FirstPersonLeak[] {
  const leaks: FirstPersonLeak[] = [];
  const resume = adaptation.adaptedResume;

  const check = (field: string, text?: string | null) => {
    if (!text) return;
    const word = findForbiddenWord(text);
    if (word) leaks.push({ field, word });
  };

  check("headline", resume.headline);
  resume.additionalInfo?.forEach((item, index) => check(`additionalInfo[${index}]`, item));
  resume.experience?.forEach((item) => {
    check(`experience(${item.company || item.sourceIndex}).focus`, item.focus);
    item.adaptedBullets?.forEach((bullet, index) =>
      check(`experience(${item.company || item.sourceIndex}).adaptedBullets[${index}]`, bullet)
    );
  });

  return leaks;
}

export function createFirstPersonRetryNotice(leaks: FirstPersonLeak[]) {
  const lines = leaks.map((leak) => `- ${leak.field}: содержит слово первого лица "${leak.word}"`);

  return `
В твоём предыдущем ответе есть формулировки от первого лица в bullets опыта, focus или
additionalInfo - это нарушает правило "в bullets опыта, focus и additionalInfo не используй
первое лицо: я, мой, моя, мы, наш, имею, умею, работаю, специализируюсь".

Где именно:
${lines.join("\n")}

Верни результат заново, переписав эти места нейтральными формулировками без первого лица
(как в остальных bullets резюме), сохранив смысл и факты. Summary при этом ДОЛЖЕН остаться
от первого лица - его не меняй на третье лицо.
`.trim();
}
