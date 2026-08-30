const FALLBACK_ORIGIN = 'https://internal.invalid';

export function getSafeInternalPath(
  value: string | null | undefined,
  fallback = '/dashboard',
) {
  if (!value || value.length > 2048 || /[\\\u0000-\u001f\u007f]/u.test(value)) {
    return fallback;
  }

  try {
    const target = new URL(value, FALLBACK_ORIGIN);
    if (target.origin !== FALLBACK_ORIGIN || !value.startsWith('/')) {
      return fallback;
    }

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}
