import { JOB_POSTING_EXTRACTOR_SCRIPT } from "./job-posting-extractor-script.js";

export const READABLE_PAGE_EXTRACTOR_SCRIPT = String.raw`(() => {
  function meta(selector) {
    const element = document.querySelector(selector);
    const content = element && element.getAttribute
      ? element.getAttribute("content") : null;
    return typeof content === "string" && content.trim() ? content.trim() : null;
  }

  function normalize(value) {
    return String(value || "").replace(/\r/g, "\n").split("\n")
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean).join("\n").trim();
  }

  function visible(element) {
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
      return false;
    }
    if (element.getAttribute && element.getAttribute("aria-hidden") === "true") return false;
    const rect = element.getBoundingClientRect();
    return Boolean(rect && rect.width >= 40 && rect.height >= 20);
  }

  function elementText(element) {
    return normalize(element.innerText || element.textContent || "");
  }

${JOB_POSTING_EXTRACTOR_SCRIPT}

  function noisy(element) {
    const identity = [element.tagName || "", element.id || "", element.className || ""]
      .join(" ").toLowerCase();
    return /nav|header|footer|aside|menu|cookie|banner|modal|popup|drawer|sidebar|subscribe|newsletter/
      .test(identity);
  }

  function scoreElement(element) {
    if (!visible(element) || noisy(element)) return null;
    const text = elementText(element);
    const textLength = text.length;
    if (textLength < 160) return null;
    const linkText = Array.from(element.querySelectorAll("a"))
      .map(elementText).join("\n");
    const buttonText = Array.from(element.querySelectorAll("button, input, select, textarea"))
      .map(elementText).join("\n");
    const lineCount = text.split("\n").filter(Boolean).length;
    const tagName = String(element.tagName || "").toLowerCase();
    const role = String(element.getAttribute ? element.getAttribute("role") || "" : "")
      .toLowerCase();
    let score = Math.min(textLength / 80, 100) + Math.min(lineCount * 2, 40);
    if (tagName === "main") score += 45;
    if (tagName === "article") score += 35;
    if (role === "main") score += 40;
    if (tagName === "section") score += 12;
    score -= (linkText.length / Math.max(textLength, 1)) * 90;
    score -= (buttonText.length / Math.max(textLength, 1)) * 80;
    if (lineCount < 4) score -= 20;
    if (textLength > 30000) score -= 15;
    return { text, score };
  }

  const title = meta('meta[property="og:title"]') || normalize(document.title || "") || null;
  const description = meta('meta[name="description"]')
    || meta('meta[property="og:description"]') || null;
  const headings = Array.from(document.querySelectorAll("h1, h2"))
    .filter(visible).map(elementText).filter(Boolean).slice(0, 8);
  const candidates = Array.from(
    document.querySelectorAll("main, article, [role='main'], section, div")
  ).map(scoreElement).filter(Boolean).sort((left, right) => right.score - left.score);
  const structured = jobPostingData();
  const structuredText = structured ? structured.text : "";
  const bestText = structuredText || (candidates[0] && candidates[0].text
    ? candidates[0].text
    : normalize(document.body ? document.body.innerText || document.body.textContent || "" : ""));
  const text = normalize([title].concat(headings).concat([bestText])
    .filter(Boolean).join("\n\n"));
  return { title, description, text, jobPosting: structured ? structured.vacancy : null };
})()`;
