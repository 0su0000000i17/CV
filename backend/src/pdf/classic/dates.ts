const MONTHS: Record<string, number> = {
  январь: 0,
  февраля: 1,
  февраль: 1,
  марта: 2,
  март: 2,
  апреля: 3,
  апрель: 3,
  мая: 4,
  май: 4,
  июня: 5,
  июнь: 5,
  июля: 6,
  июль: 6,
  августа: 7,
  август: 7,
  сентября: 8,
  сентябрь: 8,
  октября: 9,
  октябрь: 9,
  ноября: 10,
  ноябрь: 10,
  декабря: 11,
  декабрь: 11,
};

function parseMonthYear(value: string) {
  const match = value.toLowerCase().match(/([а-яё]+)\s+(\d{4})/i);

  if (!match?.[1] || !match[2]) {
    return null;
  }

  const month = MONTHS[match[1]];

  if (month === undefined) {
    return null;
  }

  return {
    month,
    year: Number(match[2]),
  };
}

function formatDuration(totalMonths: number) {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const result: string[] = [];

  if (years) {
    result.push(years === 1 ? "1 год" : years < 5 ? `${years} года` : `${years} лет`);
  }

  if (months) {
    result.push(months === 1 ? "1 месяц" : months < 5 ? `${months} месяца` : `${months} месяцев`);
  }

  return result.join(" ");
}

export function getPeriodDuration(dates: string | null) {
  if (!dates) {
    return null;
  }

  const [startRaw, endRaw] = dates.split("—").map((item) => item.trim());
  const start = parseMonthYear(startRaw || "");
  const end = parseMonthYear(endRaw || "");

  if (!start || !end) {
    return null;
  }

  const months = (end.year - start.year) * 12 + (end.month - start.month) + 1;

  return months > 0 ? formatDuration(months) : null;
}

export function getTotalExperience(dates: Array<string | null>) {
  const total = dates
    .map(getPeriodDuration)
    .map((value) => value?.match(/(\d+)\s+год|\b(\d+)\s+лет|\b(\d+)\s+месяц/g))
    .filter(Boolean);

  return total.length ? null : null;
}