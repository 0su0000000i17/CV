const STORAGE_KEY = 'cvmatch-utm-attribution';
const SOURCE_LIMIT = 128;
const MEDIUM_LIMIT = 128;
const CAMPAIGN_LIMIT = 256;

export type UtmAttribution = {
  utmSource: string;
  utmMedium: string | null;
  utmCampaign: string | null;
};

// First-touch attribution: only ever written once per browser. A later visit
// with different (or no) utm params must not overwrite the original source.
export function captureUtmFromUrl() {
  if (typeof window === 'undefined') return;

  try {
    if (window.localStorage.getItem(STORAGE_KEY)) return;

    const params = new URLSearchParams(window.location.search);
    const attribution = normalizeAttribution({
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign'),
    });
    if (!attribution) return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Storage can be unavailable in hardened/private browser contexts.
  }
}

export function getStoredUtmAttribution(): UtmAttribution | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeAttribution(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function normalizeAttribution(value: unknown): UtmAttribution | null {
  if (!value || typeof value !== 'object') return null;

  const input = value as Record<string, unknown>;
  const utmSource = normalizeValue(input.utmSource, SOURCE_LIMIT);
  if (!utmSource) return null;

  return {
    utmSource,
    utmMedium: normalizeValue(input.utmMedium, MEDIUM_LIMIT),
    utmCampaign: normalizeValue(input.utmCampaign, CAMPAIGN_LIMIT),
  };
}

function normalizeValue(value: unknown, limit: number) {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/[\u0000-\u001f\u007f]+/gu, ' ').trim();
  return normalized ? normalized.slice(0, limit) : null;
}
