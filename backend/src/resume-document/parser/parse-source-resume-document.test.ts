import assert from "node:assert/strict";
import test from "node:test";

import { parseSourceResumeDocument } from "./parse-source-resume-document.js";

const HH_RESUME = `
Иван Иванович Иванов
Мужчина, 31 год, родился 1 января 1995
+7 999 123-45-67
ivan@example.com — предпочитаемый способ связи
Москва, м. Белорусская
Гражданство: Россия, есть разрешение на работу: Россия
Желаемая должность и зарплата
Frontend-разработчик
200 000 руб. на руки
Специализации: Программист, разработчик
Занятость: полная занятость
График работы: удаленная работа
Опыт работы — 1 год 9 месяцев
Апрель 2024 — Декабрь 2025
Сбер
Москва, sber.ru
Frontend-разработчик
Проект: Клиентский кабинет
- Разработал дизайн-систему
- Ускорил загрузку на 30%
Стек: React, TypeScript, Next.js
Образование
Высшее
2020 МГУ, Москва
Факультет ВМК, Прикладная математика
Ключевые навыки
React
TypeScript
REST API
Знание языков
Русский — Родной
Английский — B2 — Средне-продвинутый
Обо мне
Разрабатываю доступные интерфейсы.
`;

test("parses the main hh.ru resume sections without losing structure", () => {
  const result = parseSourceResumeDocument(HH_RESUME);

  assert.equal(result.source, "hh_pdf");
  assert.equal(result.personal.fullName, "Иван Иванович Иванов");
  assert.equal(result.personal.email, "ivan@example.com");
  assert.equal(result.target.title, "Frontend-разработчик");
  assert.equal(result.experience.items[0]?.company.name, "Сбер");
  assert.equal(result.experience.items[0]?.position, "Frontend-разработчик");
  assert.deepEqual(result.experience.items[0]?.blocks
    .filter((block) => block.type === "bullet")
    .map((block) => block.type === "bullet" ? block.text : ""), [
    "Разработал дизайн-систему",
    "Ускорил загрузку на 30%",
  ]);
  assert.ok(result.skills.items.includes("REST API"));
  assert.equal(result.skills.languages[1]?.level, "B2");
  assert.equal(result.skills.languages[1]?.description, "Средне — продвинутый");
  assert.match(result.additional.about.join("\n"), /доступные интерфейсы/u);
});
