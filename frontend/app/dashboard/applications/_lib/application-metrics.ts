import type { ApplicationStatus, JobApplication } from '@/src/shared/api/applications';

import type { TrackerFilter } from './application-presentation';

const SENT = new Set<ApplicationStatus>(['applied', 'interview', 'offer', 'rejected']);
const RESPONDED = new Set<ApplicationStatus>(['interview', 'offer', 'rejected']);
const INTERVIEWED = new Set<ApplicationStatus>(['interview', 'offer']);

export function filterApplications(items: JobApplication[], filter: TrackerFilter) {
  if (filter === 'active') {
    return items.filter((item) => item.status === 'planned' || item.status === 'applied');
  }
  if (filter === 'interviews') {
    return items.filter((item) => item.status === 'interview');
  }
  if (filter === 'closed') {
    return items.filter((item) =>
      item.status === 'offer' || item.status === 'rejected' || item.status === 'withdrawn'
    );
  }
  return items;
}

export function calculateMetrics(applications: JobApplication[]) {
  const sent = applications.filter((item) => SENT.has(item.status));
  const responses = sent.filter((item) => RESPONDED.has(item.status));
  const interviews = sent.filter((item) => INTERVIEWED.has(item.status));
  const variantsByName = new Map<string, JobApplication[]>();

  for (const application of sent) {
    const items = variantsByName.get(application.resume_variant) ?? [];
    items.push(application);
    variantsByName.set(application.resume_variant, items);
  }

  const variants = Array.from(variantsByName, ([name, items]) => {
    const variantResponses = items.filter((item) => RESPONDED.has(item.status)).length;
    const variantInterviews = items.filter((item) => INTERVIEWED.has(item.status)).length;
    return {
      name,
      sent: items.length,
      responses: variantResponses,
      interviews: variantInterviews,
      responseRate: Math.round((variantResponses / items.length) * 100),
    };
  }).sort((left, right) => right.sent - left.sent || right.responseRate - left.responseRate);

  return {
    sent: sent.length,
    responses: responses.length,
    interviews: interviews.length,
    responseRate: sent.length ? Math.round((responses.length / sent.length) * 100) : 0,
    variants,
  };
}
