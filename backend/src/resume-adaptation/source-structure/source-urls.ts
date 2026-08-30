import { clean } from "./text-core.js";

function urlKey(value: string) {
  return clean(value).toLowerCase().replace(/[^a-zа-яё0-9]+/giu, "");
}

export function repairSpacedUrls(value: string) {
  return value
    .replace(/\b(https?)\s*:\s*\/\s*\/\s*/giu, "$1://")
    .replace(
      /(https?:\/\/[^\s/]+)((?:\s*\/\s*[^\s/]+)+)/giu,
      (_match, origin: string, path: string) =>
        `${origin}${path.replace(/\s*\/\s*/gu, "/")}`,
    );
}

export function restoreKnownSourceUrls(value: string, sourceUrls: string[]) {
  let result = repairSpacedUrls(value);
  for (const sourceUrl of sourceUrls) {
    const sourceKey = urlKey(sourceUrl);
    if (!sourceKey) continue;
    result = result.replace(/https?:\/\/[^\s)]+/giu, (candidate) =>
      urlKey(candidate) === sourceKey ? sourceUrl : candidate,
    );
  }
  return result;
}
