import type { ClassicDocument } from "../../types.js";
import { clean } from "../helpers.js";
import { colors, page, typography } from "../layout.js";
import type { PdfWriter } from "../writer.js";

export function renderFooter(writer: PdfWriter, doc: ClassicDocument) {
  const footer = clean(doc.snapshot.footer || "").replace(
    /^(Резюме\s+обновлено\s*)+/iu,
    "Резюме обновлено ",
  );
  if (!footer) return;
  const style = { size: typography.footer, color: colors.muted, lineGap: 0 } as const;
  const height = writer.measure(footer, writer.contentWidth, style);
  const y = Math.min(writer.y + 21, page.height - 18 - height);
  writer.textAt(footer, writer.left, y, writer.contentWidth, style);
  writer.y = y + height;
}
