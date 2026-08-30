export const photoExtractorScript = String.raw`
from pathlib import Path
import json
import sys

import pdfplumber
import pypdfium2 as pdfium

input_path = Path(sys.argv[1])
output_path = Path(sys.argv[2])
max_pages = int(sys.argv[3])
CSS_PIXELS_PER_PDF_POINT = 96 / 72
RENDER_SCALE = 2.5
MAX_RENDER_SIDE = 6000
MAX_RENDER_PIXELS = 24_000_000


def is_reasonable_photo(width, height, source_width, source_height):
    if width < 45 or height < 45 or source_width < 60 or source_height < 60:
        return False
    ratio = width / float(height)
    return 0.42 <= ratio <= 1.5


def visual_complexity(image):
    rgb = image.convert("RGB")
    sample = rgb.resize((48, 48))
    colors = set()
    non_white = 0
    for red, green, blue in sample.getdata():
        if red < 238 or green < 238 or blue < 238:
            non_white += 1
        colors.add((red // 16, green // 16, blue // 16))
    return non_white / float(48 * 48), len(colors)


def candidate_score(page_width, image, order_index):
    x0 = float(image.get("x0") or 0)
    top = float(image.get("top") or 0)
    width = float(image.get("width") or 0)
    height = float(image.get("height") or 0)
    source_width, source_height = image.get("srcsize") or (0, 0)
    score = width * height + source_width * source_height * 0.015
    if x0 <= page_width * 0.38:
        score *= 3.0
    if top <= 240:
        score *= 2.1
    ratio = width / max(1.0, height)
    if 0.55 <= ratio <= 1.05:
        score *= 1.6
    score *= 1.0 / (1 + order_index * 0.03)
    return score


best = None

with pdfplumber.open(str(input_path)) as source:
    if len(source.pages) > max_pages:
        print(json.dumps({"ok": False, "reason": "too_many_pages"}))
        sys.exit(0)
    pdf = pdfium.PdfDocument(str(input_path))
    for page_index, page in enumerate(source.pages[:2]):
        render_width = float(page.width) * RENDER_SCALE
        render_height = float(page.height) * RENDER_SCALE
        if render_width > MAX_RENDER_SIDE or render_height > MAX_RENDER_SIDE or render_width * render_height > MAX_RENDER_PIXELS:
            continue
        candidates = []
        for order_index, image in enumerate(page.images):
            width = float(image.get("width") or 0)
            height = float(image.get("height") or 0)
            source_width, source_height = image.get("srcsize") or (0, 0)
            if not is_reasonable_photo(width, height, source_width, source_height):
                continue
            candidates.append((order_index, image))

        if not candidates:
            continue

        rendered = pdf[page_index].render(scale=RENDER_SCALE).to_pil().convert("RGB")
        for order_index, image in candidates:
            box = (
                round(float(image["x0"]) * RENDER_SCALE),
                round(float(image["top"]) * RENDER_SCALE),
                round(float(image["x1"]) * RENDER_SCALE),
                round(float(image["bottom"]) * RENDER_SCALE),
            )
            crop = rendered.crop(box)
            non_white, colors = visual_complexity(crop)
            if non_white < 0.22 or colors < 24:
                continue
            score = candidate_score(float(page.width), image, order_index)
            if best is None or score > best["score"]:
                best = {
                    "score": score,
                    "image": crop,
                    "displayWidth": round(float(image["width"]) * CSS_PIXELS_PER_PDF_POINT, 2),
                    "displayHeight": round(float(image["height"]) * CSS_PIXELS_PER_PDF_POINT, 2),
                }

if best is None:
    print(json.dumps({"ok": False, "reason": "photo_not_found"}))
    sys.exit(0)

best["image"].save(output_path, "PNG", optimize=True)
print(json.dumps({
    "ok": True,
    "displayWidth": best["displayWidth"],
    "displayHeight": best["displayHeight"],
}))
`;
