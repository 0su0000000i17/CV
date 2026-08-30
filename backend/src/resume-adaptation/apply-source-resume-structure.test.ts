import assert from "node:assert/strict";
import test from "node:test";

import {
  applyGenderInflection,
  mergePreservingSourceBullets,
} from "./apply-source-resume-structure.js";

test("normalizes feminine adaptation verbs back to the male source gender", () => {
  const generated = [
    "Самостоятельно спроектировала и разработала AI-продукт.",
    "Координировала разработчиков и настраивала процессы.",
    "Интегрировала API, обучала коллег и устранила ошибки.",
    "Применяла React, работала с метриками и достигла результата.",
  ].join(" ");

  assert.equal(
    applyGenderInflection(generated, "male"),
    [
      "Самостоятельно спроектировал и разработал AI-продукт.",
      "Координировал разработчиков и настраивал процессы.",
      "Интегрировал API, обучал коллег и устранил ошибки.",
      "Применял React, работал с метриками и достиг результата.",
    ].join(" "),
  );
});

test("normalizes male adaptation verbs to the female source gender", () => {
  assert.equal(
    applyGenderInflection(
      "Спроектировал интерфейс, внедрил дизайн-систему и руководил командой.",
      "female",
    ),
    "Спроектировала интерфейс, внедрила дизайн-систему и руководила командой.",
  );
});

test("does not alter gendered substrings inside longer words", () => {
  assert.equal(
    applyGenderInflection(
      "Создала библиотеку, которую команда использовала в проекте.",
      "male",
    ),
    "Создал библиотеку, которую команда использовала в проекте.",
  );
  assert.equal(
    applyGenderInflection("Настраивалась система", "male"),
    "Настраивалась система",
  );
});

test("keeps a distinct source achievement when the model omits it", () => {
  const architecture =
    "Спроектировал архитектуру приложения на Next.js с гибридным рендерингом.";
  const recognition =
    "Награждён официальной благодарностью за высокий уровень технической экспертизы.";
  const result = mergePreservingSourceBullets(
    [architecture, recognition],
    [
      "Спроектировал архитектуру приложения на Next.js с гибридным рендерингом и внедрил её в продукт.",
    ],
  );

  assert.equal(result.length, 2);
  assert.equal(result[1], recognition);
});
