export const extractorScriptRunner = String.raw`
input_path = sys.argv[1]
output_path = sys.argv[2]
max_pages = int(sys.argv[3])
pages = []

with pdfplumber.open(input_path) as pdf:
    if len(pdf.pages) > max_pages:
        raise ValueError(f"PDF has more than {max_pages} pages")
    for page_number, page in enumerate(pdf.pages, start=1):
        words = page.extract_words(
            x_tolerance=1.5,
            y_tolerance=2.5,
            keep_blank_chars=False,
            use_text_flow=False,
            extra_attrs=["fontname", "size", "non_stroking_color"],
        )
        pages.append({
            "page": page_number,
            "width": rounded(page.width),
            "height": rounded(page.height),
            "lines": build_lines(words, page_number),
        })

with open(output_path, "w", encoding="utf-8") as output:
    json.dump({"version": 1, "pages": pages}, output, ensure_ascii=False)
`;
