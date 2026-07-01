export function getScoreBarClass(score: number) {
  if (score >= 80) {
    return 'bg-emerald-500';
  }

  if (score >= 60) {
    return 'bg-amber-500';
  }

  return 'bg-red-500';
}

export function getScoreTextClass(score?: number) {
  if (typeof score !== 'number') {
    return 'text-muted-foreground';
  }

  if (score >= 80) {
    return 'text-emerald-400';
  }

  if (score >= 60) {
    return 'text-amber-400';
  }

  return 'text-red-400';
}
