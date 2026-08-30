function base64ByteLength(value: string) {
  const normalized = value.replace(/\s+/g, '');
  const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((normalized.length * 3) / 4) - padding);
}

function pngDimension(binary: string, offset: number) {
  return ((binary.charCodeAt(offset) << 24) |
    (binary.charCodeAt(offset + 1) << 16) |
    (binary.charCodeAt(offset + 2) << 8) |
    binary.charCodeAt(offset + 3)) >>> 0;
}

function parsePngSize(value: string) {
  try {
    const binary = atob(value.slice(0, 64));
    if (binary.length < 24 || binary.charCodeAt(0) !== 0x89 ||
      binary.slice(1, 4) !== 'PNG') return null;
    return { width: pngDimension(binary, 16), height: pngDimension(binary, 20) };
  } catch { return null; }
}

function isLikelyServiceLogo(value: string) {
  const match = value.match(/^data:image\/(?:png|jpeg|jpg|webp);base64,([a-z0-9+/=\r\n]+)$/i);
  if (!match?.[1]) return false;
  const size = parsePngSize(match[1]);
  const square = size && size.width <= 96 && size.height <= 96 &&
    Math.abs(size.width - size.height) <= 6;
  return Boolean(square && base64ByteLength(match[1]) <= 4_500);
}

export function normalizeProfilePhotoUrl(value?: string | null) {
  const url = value?.trim() || '';
  return !url || isLikelyServiceLogo(url) ? null : url;
}
