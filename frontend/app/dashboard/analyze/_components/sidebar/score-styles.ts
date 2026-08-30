export function getScoreBarClass() {
  return 'bg-white/70';
}

export function getScoreTextClass(score?: number) {
  if (typeof score !== 'number') {
    return 'text-muted-foreground';
  }

  return 'text-white';
}
