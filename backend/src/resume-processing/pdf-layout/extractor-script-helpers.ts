export const extractorScriptHelpers = String.raw`
import json
import re
import sys

import pdfplumber


def rounded(value):
    return round(float(value or 0), 3)


def color_value(value):
    if value is None:
        return None
    if isinstance(value, (tuple, list)):
        return ",".join(str(round(float(item), 4)) for item in value)
    return str(value)


def clean_font(value):
    font = str(value or "")
    return font.split("+", 1)[-1]


def join_words(words):
    result = ""
    previous = None
    no_space_before = re.compile(r"^[,.;:!?%)}\]]")
    no_space_after = re.compile(r"[(\[{/]$")
    for word in words:
        value = str(word.get("text") or "").strip()
        if not value:
            continue
        gap = None if previous is None else float(word["x"]) - (float(previous["x"]) + float(previous["width"]))
        compact = gap is not None and gap <= max(0.8, min(float(word["size"]), float(previous["size"])) * 0.12)
        if not result or compact or no_space_before.search(value) or no_space_after.search(result):
            result += value
        else:
            result += " " + value
        previous = word
    return re.sub(r"\s+", " ", result).strip()


def word_model(word):
    font = clean_font(word.get("fontname"))
    size = rounded(word.get("size"))
    lower_font = font.lower()
    return {
        "text": str(word.get("text") or "").strip(),
        "x": rounded(word.get("x0")),
        "y": rounded(word.get("top")),
        "width": rounded(float(word.get("x1") or 0) - float(word.get("x0") or 0)),
        "height": rounded(float(word.get("bottom") or 0) - float(word.get("top") or 0)),
        "font": font,
        "size": size,
        "bold": bool(re.search(r"bold|semibold|demibold", lower_font)),
        "italic": bool(re.search(r"italic|oblique", lower_font)),
        "color": color_value(word.get("non_stroking_color")),
    }
`;
