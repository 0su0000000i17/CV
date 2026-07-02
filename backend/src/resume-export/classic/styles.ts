export function createClassicStyles() {
  return `
    @page { size: A4; margin: 18mm 15mm; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #222;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
      line-height: 1.36;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .resume { width: 100%; background: #fff; }
    .header { display: block; margin-bottom: 28px; }
    .photo { display: block; width: 95px; height: auto; margin-bottom: 12px; }
    .name { margin: 0 0 8px; font-size: 30px; line-height: 1.12; font-weight: 700; color: #000; }
    .contact-line { margin: 0 0 2px; font-size: 13px; line-height: 1.35; }
    .muted { color: #9d9d9d; }
    .section { margin-top: 22px; break-inside: auto; page-break-inside: auto; }
    .section-title { margin: 0 0 10px; padding-bottom: 3px; border-bottom: 1px solid #d7d7d7; color: #a7a7a7; font-size: 15px; font-weight: 400; line-height: 1.2; }
    .target-title { margin: 0 0 5px; font-size: 18px; line-height: 1.25; font-weight: 700; color: #000; }
    .target-salary { margin: 0 0 6px; font-size: 18px; font-weight: 700; color: #000; }
    .plain-line { margin: 0 0 3px; font-size: 13px; line-height: 1.36; }
    .experience-item { display: block; margin-top: 18px; break-inside: auto; page-break-inside: auto; }
    .experience-item:first-of-type { margin-top: 0; }
    .date-line { margin: 0 0 3px; color: #8f8f8f; font-size: 11px; line-height: 1.35; }
    .company { margin: 0 0 2px; font-size: 16px; line-height: 1.28; font-weight: 700; color: #000; }
    .company-meta { margin: 0 0 1px; color: #222; font-size: 12.5px; line-height: 1.35; }
    .company-meta--muted { color: #9d9d9d; }
    .position { margin: 9px 0 6px; font-size: 17px; line-height: 1.22; font-weight: 400; color: #222; }
    .work-text, .bullet { margin: 0 0 5px; font-size: 13px; line-height: 1.36; color: #222; }
    .skill-list { margin: 8px 0 0; font-size: 13px; line-height: 1.55; color: #222; }
    .details-title { margin: 0 0 4px; color: #8f8f8f; font-size: 13px; font-weight: 400; line-height: 1.36; }
    .summary { margin: 0; white-space: pre-wrap; font-size: 12.5px; line-height: 1.36; }
    .footer { margin-top: 28px; color: #8f8f8f; font-size: 11px; line-height: 1.3; }
  `;
}
