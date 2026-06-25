export function createClassicStyles() {
  return `
    @page {
      size: A4;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #222222;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
      line-height: 1.34;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      width: 210mm;
    }

    .resume {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm 14.5mm 14mm;
      background: #ffffff;
    }

    .header {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 22px;
      margin-bottom: 34px;
    }

    .header--no-photo {
      display: block;
    }

    .name {
      margin: 0 0 7px;
      font-size: 33px;
      line-height: 1.12;
      font-weight: 700;
      letter-spacing: -0.4px;
      color: #000000;
    }

    .contacts {
      max-width: 650px;
      color: #222222;
    }

    .contact-line {
      min-height: 18px;
      margin: 0;
      font-size: 13px;
      line-height: 1.35;
    }

    .contact-line + .contact-line {
      margin-top: 1px;
    }

    .contact-gap {
      margin-top: 15px;
    }

    .photo {
      width: 112px;
      height: 150px;
      object-fit: cover;
      border-radius: 0;
    }

    .section {
      margin-top: 24px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 12px;
      color: #b0b0b0;
      font-size: 16px;
      font-weight: 400;
      line-height: 1;
    }

    .section-title::after {
      content: "";
      height: 1px;
      flex: 1;
      background: #d7d7d7;
      transform: translateY(1px);
    }

    .target-title {
      margin: 0 0 8px;
      font-size: 16px;
      line-height: 1.3;
      font-weight: 700;
      color: #000000;
    }

    .plain-line {
      margin: 0;
      font-size: 13px;
      line-height: 1.36;
    }

    .plain-line + .plain-line {
      margin-top: 2px;
    }

    .plain-line--indent {
      padding-left: 34px;
    }

    .experience-item {
      display: grid;
      grid-template-columns: 99px 1fr;
      column-gap: 14px;
      margin-top: 18px;
      break-inside: auto;
      page-break-inside: auto;
    }

    .experience-item:first-of-type {
      margin-top: 0;
    }

    .dates {
      color: #8f8f8f;
      font-size: 11px;
      line-height: 1.38;
      padding-top: 2px;
    }

    .date-line {
      margin: 0;
    }

    .company {
      margin: 0 0 2px;
      font-size: 16px;
      line-height: 1.28;
      font-weight: 700;
      color: #000000;
    }

    .company-meta {
      margin: 0;
      color: #222222;
      font-size: 12.5px;
      line-height: 1.35;
    }

    .company-meta + .company-meta {
      margin-top: 1px;
    }

    .position {
      margin: 10px 0 7px;
      font-size: 18px;
      line-height: 1.22;
      font-weight: 400;
      color: #222222;
    }

    .work-text {
      margin: 0;
      font-size: 13px;
      line-height: 1.36;
      color: #222222;
    }

    .work-text + .work-text {
      margin-top: 6px;
    }

    .bullet {
      margin: 0;
      font-size: 13px;
      line-height: 1.36;
      color: #222222;
    }

    .bullet + .bullet {
      margin-top: 5px;
    }

    .education-row {
      display: grid;
      grid-template-columns: 99px 1fr;
      column-gap: 14px;
      margin-top: 8px;
    }

    .education-year {
      color: #8f8f8f;
      font-size: 11px;
      line-height: 1.38;
    }

    .education-text {
      margin: 0;
      font-size: 13px;
      line-height: 1.36;
    }

    .skill-row {
      display: grid;
      grid-template-columns: 99px 1fr;
      column-gap: 14px;
      margin-top: 7px;
    }

    .side-label {
      font-size: 13px;
      line-height: 1.36;
      color: #222222;
    }

    .language-lines {
      margin-bottom: 10px;
    }

    .skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      align-items: flex-start;
    }

    .skill-tag {
      display: inline-block;
      padding: 3px 8px 4px;
      background: #f1f1f1;
      border-radius: 2px;
      font-size: 12px;
      line-height: 1.2;
      color: #222222;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 99px 1fr;
      column-gap: 14px;
    }

    .summary {
      margin: 0;
      white-space: pre-wrap;
      font-size: 13px;
      line-height: 1.36;
    }

    .footer {
      margin-top: 28px;
      color: #8f8f8f;
      font-size: 11px;
      line-height: 1.3;
    }
  `;
}