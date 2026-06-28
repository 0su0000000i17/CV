export function createClassicStyles() {
  return `
    @page { size: 210mm 297mm; margin: 18mm 14.5mm 19mm; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #222;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
      line-height: 1.34;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    p, h1, h2, h3, h4 { orphans: 3; widows: 3; }
    .resume { width: 100%; min-height: auto; background: #fff; overflow: visible; }
    .header {
      display: grid;
      grid-template-columns: 95px minmax(0, 1fr);
      column-gap: 19px;
      align-items: start;
      margin-bottom: 34px;
    }
    .header--no-photo { display: block; }
    .header-content { min-width: 0; }
    .name { margin: 0 0 2px; font-size: 33px; line-height: 1.12; font-weight: 700; letter-spacing: -0.4px; color: #000; }
    .contacts { max-width: 650px; color: #222; }
    .contact-line { min-height: 18px; margin: 0; font-size: 13px; line-height: 1.35; }
    .contact-line + .contact-line { margin-top: 1px; }
    .contact-line--gap { margin-top: 16px; }
    .muted { color: #b4b4b4; }
    .photo { display: block; width: 95px; height: 112px; object-fit: cover; border-radius: 0; }
    .section { margin-top: 24px; }
    .section-title {
      display: block;
      width: 100%;
      margin: 0 0 12px;
      padding: 0 0 2px;
      border-bottom: 1px solid #d7d7d7;
      color: #b3b3b3;
      font-size: 15px;
      font-weight: 400;
      line-height: 1.05;
    }
    .section-title span { position: relative; top: 1px; display: inline; white-space: nowrap; }
    .target-title { margin: 0 0 6px; font-size: 16px; line-height: 1.3; font-weight: 700; color: #000; }
    .plain-line { margin: 0; font-size: 13px; line-height: 1.36; }
    .plain-line + .plain-line { margin-top: 2px; }
    .plain-line--indent { padding-left: 20px; }
    .experience-item {
      display: grid;
      grid-template-columns: 99px 1fr;
      column-gap: 14px;
      margin-top: 18px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .experience-item:first-of-type { margin-top: 0; }
    .dates { color: #8f8f8f; font-size: 11px; line-height: 1.38; padding-top: 2px; }
    .date-line { margin: 0; }
    .company { margin: 0 0 2px; font-size: 16px; line-height: 1.28; font-weight: 700; color: #000; }
    .company-meta { margin: 0; color: #222; font-size: 12.5px; line-height: 1.35; }
    .company-meta--muted { color: #b5b5b5; }
    .company-meta + .company-meta { margin-top: 1px; }
    .position { margin: 10px 0 7px; font-size: 17px; line-height: 1.22; font-weight: 400; color: #222; }
    .work-text { margin: 0; font-size: 13px; line-height: 1.36; color: #222; }
    .work-text + .work-text { margin-top: 6px; }
    .bullet { margin: 0; font-size: 13px; line-height: 1.36; color: #222; }
    .bullet + .bullet { margin-top: 5px; }
    .education-row, .skill-row, .details-grid {
      display: grid;
      grid-template-columns: 99px 1fr;
      column-gap: 14px;
    }
    .education-row { margin-top: 8px; }
    .education-year, .side-label { color: #8f8f8f; font-size: 11px; line-height: 1.38; }
    .side-label { font-size: 13px; line-height: 1.36; }
    .education-text { margin: 0; font-size: 17px; line-height: 1.3; }
    .skill-row { margin-top: 7px; }
    .language-lines { margin-bottom: 10px; }
    .skill-tags { display: block; line-height: 1.95; }
    .skill-tag {
      display: inline-block;
      margin: 0 9px 7px 0;
      padding: 1px 4px 2px;
      background: #d4d4d4;
      font-size: 13px;
      line-height: 1.18;
      color: #222;
      white-space: nowrap;
    }
    .summary { margin: 0; white-space: pre-wrap; font-size: 12.5px; line-height: 1.35; }
    .footer { margin-top: 28px; color: #8f8f8f; font-size: 11px; line-height: 1.3; }
  `;
}
