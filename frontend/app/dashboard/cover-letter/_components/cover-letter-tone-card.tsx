import type { CoverLetterTone } from '@/src/shared/api/cover-letters';
import { CoverLetterGeneratorCard } from '@/src/features/cover-letter/ui/cover-letter-generator-card';

type Props = {
  selectedTone: CoverLetterTone;
  isGenerating: boolean;
  canGenerate: boolean;
  onSelectTone: (tone: CoverLetterTone) => void;
  onGenerate: () => void;
};

export function CoverLetterToneCard(props: Props) {
  return <CoverLetterGeneratorCard {...props} />;
}
