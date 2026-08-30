const MAX_RESUME_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_RESUME_PHOTO_SIDE = 6_000;
const MAX_RESUME_PHOTO_PIXELS = 24_000_000;
export const MAX_RESUME_PHOTO_DATA_URL_CHARS = 7_000_000;

const PHOTO_DATA_URL_PATTERN =
  /^data:(image\/(?:png|jpeg|jpg));base64,([a-z0-9+/]+={0,2})$/iu;

export type ResumePhotoData = {
  contentType: "image/png" | "image/jpeg";
  bytes: number;
  width: number;
  height: number;
};

function getPngDimensions(buffer: Buffer) {
  const signature = "89504e470d0a1a0a";
  if (
    buffer.length < 24 ||
    buffer.subarray(0, 8).toString("hex") !== signature ||
    buffer.subarray(12, 16).toString("ascii") !== "IHDR"
  ) {
    return null;
  }

  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function getJpegDimensions(buffer: Buffer) {
  if (buffer.length < 10 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  const startOfFrameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ]);
  let offset = 2;

  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === undefined || marker === 0xd9 || marker === 0xda) return null;
    if (marker === 0xd8 || marker === 0x01) continue;
    if (offset + 2 > buffer.length) return null;

    const segmentLength = buffer.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > buffer.length) return null;
    if (startOfFrameMarkers.has(marker) && segmentLength >= 7) {
      return {
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += segmentLength;
  }

  return null;
}

export function parseResumePhotoDataUrl(value: string): ResumePhotoData | null {
  const match = PHOTO_DATA_URL_PATTERN.exec(value);
  if (!match?.[1] || !match[2]) return null;
  if (match[2].length % 4 !== 0) return null;

  const buffer = Buffer.from(match[2], "base64");
  const bytes = buffer.length;
  if (bytes < 1 || bytes > MAX_RESUME_PHOTO_BYTES) return null;

  const isPng = match[1].toLowerCase() === "image/png";
  const dimensions = isPng ? getPngDimensions(buffer) : getJpegDimensions(buffer);
  if (!dimensions) return null;
  if (
    dimensions.width < 1 ||
    dimensions.height < 1 ||
    dimensions.width > MAX_RESUME_PHOTO_SIDE ||
    dimensions.height > MAX_RESUME_PHOTO_SIDE ||
    dimensions.width * dimensions.height > MAX_RESUME_PHOTO_PIXELS
  ) {
    return null;
  }

  return {
    contentType: isPng ? "image/png" : "image/jpeg",
    bytes,
    ...dimensions,
  };
}
