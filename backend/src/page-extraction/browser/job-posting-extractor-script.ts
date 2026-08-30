export const JOB_POSTING_EXTRACTOR_SCRIPT = String.raw`
  function plainText(value) {
    if (typeof value !== "string") return "";
    const holder = document.createElement("div");
    holder.innerHTML = value;
    return normalize(holder.innerText || holder.textContent || "");
  }

  function findJobPosting(value) {
    if (!value || typeof value !== "object") return null;
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = findJobPosting(item);
        if (found) return found;
      }
      return null;
    }
    const type = value["@type"];
    if (type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"))) {
      return value;
    }
    return findJobPosting(value["@graph"] || value.mainEntity || value.itemListElement);
  }

  function scalar(value) {
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (Array.isArray(value)) return value.map(scalar).filter(Boolean).join(", ");
    if (!value || typeof value !== "object") return "";
    return scalar(value.value || value.name || value.minValue || value.maxValue);
  }

  function locationText(value) {
    const location = Array.isArray(value) ? value[0] : value || {};
    const address = location.address || location;
    return [address.addressLocality, address.addressRegion, address.addressCountry]
      .map(scalar).filter(Boolean).join(", ") || scalar(location.name);
  }

  function salaryText(value) {
    if (!value || typeof value !== "object") return scalar(value);
    const amount = value.value || value;
    const range = [scalar(amount.minValue), scalar(amount.maxValue)].filter(Boolean).join("–")
      || scalar(amount.value || amount);
    return [range, scalar(value.currency), scalar(amount.unitText)]
      .filter(Boolean).join(" ");
  }

  function contentText(value) {
    if (Array.isArray(value)) return normalize(value.map(contentText).filter(Boolean).join("\n"));
    if (typeof value === "string") return plainText(value);
    return plainText(scalar(value));
  }

  function postingData(posting) {
    const organization = posting.hiringOrganization || {};
    const vacancy = {
      title: scalar(posting.title),
      company: scalar(organization.name),
      location: locationText(posting.jobLocation),
      employment: scalar(posting.employmentType),
      workHours: scalar(posting.workHours),
      salary: salaryText(posting.baseSalary),
      description: contentText(posting.description),
      responsibilities: contentText(posting.responsibilities),
      qualifications: contentText(posting.qualifications),
      skills: contentText(posting.skills),
      experienceRequirements: contentText(posting.experienceRequirements),
      educationRequirements: contentText(posting.educationRequirements),
    };
    const text = normalize(Object.values(vacancy).filter(Boolean).join("\n"));
    return text.length >= 160 ? { text, vacancy } : null;
  }

  function jobPostingData() {
    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    for (const script of scripts.slice(0, 20)) {
      try {
        const posting = findJobPosting(JSON.parse((script.textContent || "").slice(0, 500000)));
        if (posting) {
          const result = postingData(posting);
          if (result) return result;
        }
      } catch {}
    }
    return null;
  }
`;
