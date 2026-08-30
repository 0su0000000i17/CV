import { cleanLayoutText } from "./layout-utils.js";

export function splitStackItems(value: string) {
  const result: string[] = [];
  let buffer = "";
  let depth = 0;
  for (const char of value) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);
    if ((char === "," || char === ";") && depth === 0) {
      const item = cleanLayoutText(buffer).replace(/[.;]+$/u, "");
      if (item) result.push(item);
      buffer = "";
    } else buffer += char;
  }
  const last = cleanLayoutText(buffer).replace(/[.;]+$/u, "");
  if (last) result.push(last);
  return result;
}
