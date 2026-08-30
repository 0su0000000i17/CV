export const extractorScriptLayout = String.raw`
def split_row(words):
    ordered = sorted(words, key=lambda item: (float(item["x0"]), float(item["top"])))
    if not ordered:
        return []
    groups = [[ordered[0]]]
    for word in ordered[1:]:
        previous = groups[-1][-1]
        gap = float(word["x0"]) - float(previous["x1"])
        typical_size = max(7.0, min(float(word.get("size") or 0), float(previous.get("size") or 0)))
        threshold = max(11.0, typical_size * 1.45)
        if gap > threshold:
            groups.append([word])
        else:
            groups[-1].append(word)
    return groups


def build_lines(words, page_number):
    ordered = sorted(words, key=lambda item: (float(item["top"]), float(item["x0"])))
    rows = []
    for word in ordered:
        top = float(word["top"])
        match = None
        for row in reversed(rows[-4:]):
            tolerance = max(2.2, min(4.0, float(word.get("size") or 0) * 0.35))
            if abs(top - row["top"]) <= tolerance:
                match = row
                break
        if match is None:
            rows.append({"top": top, "words": [word]})
        else:
            match["words"].append(word)
            match["top"] = min(match["top"], top)

    lines = []
    line_index = 0
    for row in sorted(rows, key=lambda item: item["top"]):
        for group in split_row(row["words"]):
            models = [word_model(item) for item in group if str(item.get("text") or "").strip()]
            if not models:
                continue
            x0 = min(item["x"] for item in models)
            y0 = min(item["y"] for item in models)
            x1 = max(item["x"] + item["width"] for item in models)
            y1 = max(item["y"] + item["height"] for item in models)
            dominant = max(models, key=lambda item: (item["size"], item["width"]))
            line_index += 1
            lines.append({
                "id": f"p{page_number}_l{line_index}",
                "page": page_number,
                "text": join_words(models),
                "x": rounded(x0),
                "y": rounded(y0),
                "width": rounded(x1 - x0),
                "height": rounded(y1 - y0),
                "font": dominant["font"],
                "size": max(item["size"] for item in models),
                "bold": any(item["bold"] for item in models),
                "italic": any(item["italic"] for item in models),
                "color": dominant["color"],
                "words": models,
            })
    return sorted(lines, key=lambda item: (item["y"], item["x"]))
`;
