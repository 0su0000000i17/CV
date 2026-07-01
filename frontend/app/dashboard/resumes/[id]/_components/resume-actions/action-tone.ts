export type ActionTone = 'zinc' | 'blue' | 'green' | 'violet';

const tones = {
  zinc: {
    card: 'hover:bg-muted',
    icon: 'bg-muted text-foreground ring-border',
  },
  blue: {
    card: 'hover:border-blue-500/35 hover:bg-blue-500/5',
    icon: 'bg-blue-500/10 text-blue-300 ring-blue-500/20',
  },
  green: {
    card: 'border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10',
    icon: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25',
  },
  violet: {
    card: 'hover:border-violet-500/35 hover:bg-violet-500/5',
    icon: 'bg-violet-500/10 text-violet-300 ring-violet-500/20',
  },
};

export function getToneClassName(tone: ActionTone) {
  return tones[tone];
}
