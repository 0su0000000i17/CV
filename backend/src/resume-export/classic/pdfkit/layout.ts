export const MM_TO_PT = 2.8346456693;
export const CSS_PX_TO_PT = 0.75;

export function px(value: number) {
  return value * CSS_PX_TO_PT;
}

export const page = {
  width: 210 * MM_TO_PT,
  height: 297 * MM_TO_PT,
  marginLeft: 14.5 * MM_TO_PT,
  marginRight: 14.5 * MM_TO_PT,
  marginTop: 18 * MM_TO_PT,
  marginBottom: 22 * MM_TO_PT,
};

export const colors = {
  text: "#222222",
  black: "#000000",
  muted: "#8f8f8f",
  lightMuted: "#b3b3b3",
  line: "#d7d7d7",
  tagBg: "#d4d4d4",
};

export const fonts = {
  regular: "CV-Regular",
  bold: "CV-Bold",
  fallbackRegular: "Helvetica",
  fallbackBold: "Helvetica-Bold",
};

export const layout = {
  contentWidth: page.width - page.marginLeft - page.marginRight,
  leftColumnWidth: px(99),
  columnGap: px(14),
  sectionGap: px(24),
  experienceSectionTopGap: px(10),
  experienceGap: px(8),
  skillLabelWidth: px(99),
  skillGap: px(14),
  photoWidth: px(95),
  photoGap: px(19),
};

export const typography = {
  name: px(33),
  sectionTitle: px(15),
  targetTitle: px(16),
  salaryAmount: px(20),
  salaryNote: px(12),
  body: px(13),
  company: px(16),
  meta: px(12.5),
  position: px(17),
  date: px(11),
  summary: px(12.5),
  footer: px(11),
  skillTag: px(13),
};
