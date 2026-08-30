import { CoverLetterResultCard as SharedCoverLetterResultCard } from '@/src/features/cover-letter/ui/cover-letter-result-card';
import type { ClipboardCopyStatus } from '@/src/shared/hooks/use-clipboard-copy';

type Props = {
  coverLetterDraft: string;
  warnings: string[];
  copyStatus: ClipboardCopyStatus;
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
