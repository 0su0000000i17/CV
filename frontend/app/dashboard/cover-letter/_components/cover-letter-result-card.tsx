import { CoverLetterResultCard as SharedCoverLetterResultCard } from '@/src/features/cover-letter/ui/cover-letter-result-card';

type Props = {
  coverLetterDraft: string;
  warnings: string[];
  copyStatus: 'idle' | 'copied' | 'error';
  onCopy: () => void;
  onChange: (value: string) => void;
};

export function CoverLetterResultCard({
  coverLetterDraft,
  warnings,
  copyStatus,
  onCopy,
  onChange,
}: Props) {
  return (
    <SharedCoverLetterResultCard
      value={coverLetterDraft}
      warnings={warnings}
      copyStatus={copyStatus}
      onCopy={onCopy}
      onChange={onChange}
    />
  );
}
