export const MARKETING_SECTIONS = {
  about: 'about',
  process: 'process',
} as const;

export type MarketingSection =
  (typeof MARKETING_SECTIONS)[keyof typeof MARKETING_SECTIONS];

export const MARKETING_SCROLL_EVENT = 'otklik:marketing-scroll';
const MARKETING_SCROLL_STORAGE_KEY = 'otklik:pending-marketing-section';

function isMarketingSection(value: string | null): value is MarketingSection {
  return value !== null && Object.values(MARKETING_SECTIONS).includes(value as MarketingSection);
}

export function requestMarketingScroll(section: MarketingSection) {
  window.dispatchEvent(
    new CustomEvent<MarketingSection>(MARKETING_SCROLL_EVENT, {
      detail: section,
    }),
  );
}

export function savePendingMarketingScroll(section: MarketingSection) {
  window.sessionStorage.setItem(MARKETING_SCROLL_STORAGE_KEY, section);
}

export function takePendingMarketingScroll(): MarketingSection | null {
  const section = window.sessionStorage.getItem(MARKETING_SCROLL_STORAGE_KEY);
  window.sessionStorage.removeItem(MARKETING_SCROLL_STORAGE_KEY);

  return isMarketingSection(section) ? section : null;
}
