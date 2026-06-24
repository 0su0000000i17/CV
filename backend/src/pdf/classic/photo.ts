import { PAGE } from "./metrics.js";
import type { ClassicWriter } from "./writer.js";

function parseDataUrl(photoUrl: string) {
  return photoUrl.match(/^data:(image\/png|image\/jpe?g);base64,(.+)$/);
}

export async function drawPhoto(writer: ClassicWriter, photoUrl: string | null) {
  if (!photoUrl?.startsWith("data:image/")) {
    return false;
  }

  const match = parseDataUrl(photoUrl);

  if (!match?.[1] || !match[2]) {
    return false;
  }

  const bytes = Buffer.from(match[2], "base64");
  const image =
    match[1] === "image/png"
      ? await writer.pdfDoc.embedPng(bytes)
      : await writer.pdfDoc.embedJpg(bytes);

  writer.page.drawImage(image, {
    x: PAGE.left,
    y: PAGE.height - PAGE.photoTop - PAGE.photoSize,
    width: PAGE.photoSize,
    height: PAGE.photoSize,
  });

  return true;
}