import type { ResumeAdaptationResult } from "../types.js";
import { clean } from "./text-core.js";

function bulletKey(value: string) {
  return clean(value)
    .toLowerCase()
    .replace(/ё/gu, "е")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

export function dedupeCrossPlaceBullets(
  adapted: ResumeAdaptationResult,
): ResumeAdaptationResult {
  const seen = new Set<string>();
  const experience = adapted.adaptedResume.experience.map((item) => {
    const bullets = item.adaptedBullets || [];
    const kept: string[] = [];
    const duplicates: string[] = [];
    for (const bullet of bullets) {
      const key = bulletKey(bullet);
      if (!key) continue;
      if (seen.has(key)) duplicates.push(bullet);
      else kept.push(bullet);
    }
    while (kept.length < 2 && duplicates.length) {
      kept.push(duplicates.shift() as string);
    }
    kept.forEach((bullet) => seen.add(bulletKey(bullet)));
    return { ...item, adaptedBullets: kept.length ? kept : bullets };
  });
  return { ...adapted, adaptedResume: { ...adapted.adaptedResume, experience } };
}
