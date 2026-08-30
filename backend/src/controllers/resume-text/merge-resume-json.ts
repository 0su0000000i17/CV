function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function mergeResumeJsonWithDocument(source: unknown, fallback: unknown) {
  if (!isRecord(source) || !isRecord(fallback)) return fallback;
  const sourceResume = isRecord(source["adaptedResume"]) ? source["adaptedResume"] : null;
  const fallbackResume = isRecord(fallback["adaptedResume"])
    ? fallback["adaptedResume"] : null;
  const sourceItems = Array.isArray(sourceResume?.["experience"])
    ? sourceResume["experience"] : [];
  const fallbackItems = Array.isArray(fallbackResume?.["experience"])
    ? fallbackResume["experience"] : [];
  const experience = sourceItems.map((item, index) => {
    if (!isRecord(item)) return item;
    const sourceIndex = typeof item["sourceIndex"] === "number" ? item["sourceIndex"] : index;
    const fallbackItem = fallbackItems.find((candidate) =>
      isRecord(candidate) && candidate["sourceIndex"] === sourceIndex) || fallbackItems[index];
    if (!isRecord(fallbackItem)) return item;
    return {
      ...fallbackItem,
      ...item,
      companyCity: item["companyCity"] || fallbackItem["companyCity"] || null,
      companyUrl: item["companyUrl"] || fallbackItem["companyUrl"] || null,
      companyIndustries: Array.isArray(item["companyIndustries"])
        && item["companyIndustries"].length
        ? item["companyIndustries"] : fallbackItem["companyIndustries"] || [],
      description: item["description"] || fallbackItem["description"] || null,
    };
  });
  return {
    ...fallback,
    ...source,
    adaptedResume: { ...fallbackResume, ...sourceResume, experience },
  };
}
