export type ActionTone = 'zinc' | 'green';

const tones = {
  zinc: {
    card: 'hover:bg-muted',
    icon: 'bg-muted text-foreground ring-border',
  },
  green: {
    card: 'border-brand-500/25 bg-brand-500/5 hover:bg-brand-500/10',
    icon: 'bg-brand-500/10 text-brand-300 ring-brand-500/25',
  },
};

export function getToneClassName(tone: ActionTone) {
  return tones[tone];
}
