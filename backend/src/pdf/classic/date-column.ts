import { COLORS, FONT, LINE, PAGE } from "./metrics.js";
import { getPeriodDuration } from "./dates.js";
import type { ClassicWriter } from "./writer.js";

function splitDates(value: string) {
  const parts = value.split("—").map((part) => part.trim());

  if (parts.length < 2) {
    return [value];
  }

  return [`${parts[0]} —`, parts.slice(1).join(" — ")];
}

export function drawDateColumn(writer: ClassicWriter, dates: string | null, top: number) {
  if (!dates) {
    return;
  }

  let y = top + 2.3;

  for (const line of splitDates(dates)) {
    writer.text({
      text: line,
      x: PAGE.left,
      y,
      size: FONT.date,
      color: COLORS.muted,
    });

    y += LINE.date;
  }

  const duration = getPeriodDuration(dates);

  if (duration) {
    writer.text({
      text: duration,
      x: PAGE.left,
      y,
      size: FONT.date,
      color: COLORS.muted,
    });
  }
}