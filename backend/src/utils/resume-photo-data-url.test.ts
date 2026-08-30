import assert from "node:assert/strict";
import test from "node:test";

import { parseResumePhotoDataUrl } from "./resume-photo-data-url.js";

test("accepts bounded PNG and JPEG data URLs", () => {
  const pngHeader = Buffer.alloc(24);
  Buffer.from("89504e470d0a1a0a", "hex").copy(pngHeader);
  pngHeader.write("IHDR", 12, "ascii");
  pngHeader.writeUInt32BE(1, 16);
  pngHeader.writeUInt32BE(1, 20);
  const pngUrl = `data:image/png;base64,${pngHeader.toString("base64")}`;
  const jpegHeader = Buffer.from([
    0xff, 0xd8, 0xff, 0xc0, 0x00, 0x07, 0x08, 0x00, 0x01, 0x00, 0x01, 0xff, 0xd9,
  ]);
  const jpegUrl = `data:image/jpg;base64,${jpegHeader.toString("base64")}`;

  assert.deepEqual(parseResumePhotoDataUrl(pngUrl), {
    contentType: "image/png",
    bytes: 24,
    width: 1,
    height: 1,
  });
  assert.equal(parseResumePhotoDataUrl(jpegUrl)?.contentType, "image/jpeg");
});

test("rejects active, malformed, and empty data URLs", () => {
  assert.equal(parseResumePhotoDataUrl("data:image/svg+xml;base64,PHN2Zz4="), null);
  assert.equal(parseResumePhotoDataUrl("data:text/html;base64,PGgxPkJvb208L2gxPg=="), null);
  assert.equal(parseResumePhotoDataUrl("data:image/png;base64,"), null);
  assert.equal(parseResumePhotoDataUrl("https://example.com/photo.png"), null);
});
