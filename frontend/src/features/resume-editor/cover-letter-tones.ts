import type { CoverLetterTone } from '@/src/shared/api/cover-letters';

export const adaptationCoverLetterToneOptions: Array<{
  value: CoverLetterTone;
  title: string;
  description: string;
}> = [
  {
    value: 'strict_professional',
    title: 'Строгий профессиональный',
    description: 'Официально, спокойно, без эмоций и лишней воды.',
  },
  {
    value: 'friendly_neutral',
    title: 'Дружелюбный нейтральный',
    description: 'Человеческий тон без фамильярности и канцелярита.',
  },
  {
    value: 'confident_short',
    title: 'Уверенный короткий',
    description: 'Максимально по делу, с акцентом на пользу кандидата.',
  },
];