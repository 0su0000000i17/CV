import type { CoverLetterTone } from '@/src/shared/api/cover-letters';

export const coverLetterToneOptions: Array<{
  value: CoverLetterTone;
  title: string;
  description: string;
}> = [
  {
    value: 'strict_professional',
    title: 'Строгий профессиональный',
    description: 'Официально, спокойно и по делу',
  },
  {
    value: 'friendly_neutral',
    title: 'Дружелюбный нейтральный',
    description: 'Человеческий тон без фамильярности и лишней официальности',
  },
  {
    value: 'confident_short',
    title: 'Уверенный короткий',
    description: 'Максимально по делу, с акцентом на пользу кандидата',
  },
];
