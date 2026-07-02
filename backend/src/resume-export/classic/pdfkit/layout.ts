export const MM_TO_PT = 2.8346456693;

export const page = {
  width: 210 * MM_TO_PT,
  height: 297 * MM_TO_PT,
  marginLeft: 14.5 * MM_TO_PT,
  marginRight: 14.5 * MM_TO_PT,
  marginTop: 18 * MM_TO_PT,
  marginBottom: 19 * MM_TO_PT,
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
  leftColumnWidth: 99,
  columnGap: 14,
  sectionGap: 24,
  experienceGap: 18,
  skillLabelWidth: 99,
  skillGap: 14,
};

export const typography = {
  name: 33,
  sectionTitle: 15,
  targetTitle: 16,
  salaryAmount: 20,
  salaryNote: 12,
  body: 13,
  company: 16,
  meta: 12.5,
  position: 17,
  date: 11,
  summary: 12.5,
  footer: 11,
};
