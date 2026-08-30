export function normalizePromoCode(value: unknown) {
  const code = String(value || "").replace(/\s+/gu, "").trim().toUpperCase();
  return /^[A-ZА-ЯЁ0-9_-]{2,64}$/u.test(code) ? code : "";
}

export function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

export function toAmount(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0 || amount > 10_000_000) return null;
  return Math.round(amount);
}
