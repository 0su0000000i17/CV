import { colors, typography } from "../layout.js";
import type { TextStyle } from "../writer.js";

export const bodyStyle: TextStyle = {
  size: typography.body,
  color: colors.text,
  lineGap: 0.2,
};

export const mutedStyle: TextStyle = {
  size: typography.sideLabel,
  color: colors.muted,
  lineGap: 0.2,
};
