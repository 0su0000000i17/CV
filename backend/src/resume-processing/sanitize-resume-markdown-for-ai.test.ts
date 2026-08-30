import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeResumeMarkdownForAi } from "./sanitize-resume-markdown-for-ai.js";

test("removes personal contacts and embedded image data before AI calls", () => {
  const result = sanitizeResumeMarkdownForAi(`
Иван Иванов
Мужчина
Телефон: +7 999 123-45-67
Email: ivan@example.com
Telegram: @ivan_dev
data:image/png;base64,AAAA
Frontend-разработчик
Разрабатывал интерфейсы на Next.js
`);
  assert.equal(result.includes("Иван Иванов"), false);
  assert.equal(result.includes("999"), false);
  assert.equal(result.includes("ivan@example.com"), false);
  assert.equal(result.includes("@ivan_dev"), false);
  assert.equal(result.includes("data:image"), false);
  assert.match(result, /Next\.js/u);
});

test("keeps city and business content while removing contact URLs", () => {
  const result = sanitizeResumeMarkdownForAi(`
Город: Москва
Портфолио: https://example.com/ivan
Компания Example
- Улучшил Core Web Vitals
`);
  assert.match(result, /Город: Москва/u);
  assert.match(result, /Core Web Vitals/u);
  assert.equal(result.includes("example.com/ivan"), false);
});
