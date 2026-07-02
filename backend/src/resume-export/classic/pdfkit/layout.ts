export const MM_TO_PT = 2.8346456693;

export const page = {
  width: 210 * MM_TO_PT,
  height: 297 * MM_TO_PT,
  marginLeft: 14 * MM_TO_PT,
  marginRight: 14 * MM_TO_PT,
  marginTop: 15 * MM_TO_PT,
  marginBottom: 17 * MM_TO_PT,
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
  leftColumnWidth: 84,
  columnGap: 12,
  sectionGap: 18,
  experienceGap: 7,
  skillLabelWidth: 84,
  skillGap: 12,
};

export const typography = {
  name: 26,
  sectionTitle: 12.5,
  targetTitle: 13.2,
  salaryAmount: 15,
  salaryNote: 10,
  body: 10.4,
  company: 13.2,
  meta: 10,
  position: 13.2,
  date: 9.4,
  summary: 10.4,
  footer: 9.4,
  skillTag: 10.4,
};
