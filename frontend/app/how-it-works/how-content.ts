import { FileCheck2, MessageSquareText, ScanSearch, Sparkles, Target, WandSparkles, type LucideIcon } from 'lucide-react';

export type HowStep = { number: string; icon: LucideIcon; title: string; description: string };

export const howSteps: HowStep[] = [
  { number: '01', icon: ScanSearch, title: 'Загрузите резюме', description: 'Добавьте PDF-файл — Сервис распознает опыт, навыки и структуру, не меняя исходный документ.' },
  { number: '02', icon: FileCheck2, title: 'Получите честную оценку', description: 'Сервис разберёт позиционирование, доказательность и ATS-совместимость и покажет, что именно мешает отклику.' },
  { number: '03', icon: Target, title: 'Выберите сценарий', description: 'Усильте универсальную версию или подготовьте отдельное резюме под требования конкретной вакансии.' },
  { number: '04', icon: MessageSquareText, title: 'Ответьте на вопросы', description: 'Уточнения про метрики, масштаб задач и инструменты работают как короткая консультация с карьерным экспертом.' },
  { number: '05', icon: WandSparkles, title: 'Проверьте новую версию', description: 'Опыт и раздел «О себе» пересобираются цельно, а не дополняются случайными предложениями в конце.' },
  { number: '06', icon: Sparkles, title: 'Скачайте результат', description: 'Исходное резюме остаётся неизменным, а готовая версия сохраняется отдельно и доступна в личном кабинете.' },
];

export const howResults = [
  'Конкретные рекомендации вместо абстрактного балла',
  'Только подтверждённые факты, навыки и достижения',
  'Сильные формулировки с понятной карьерной логикой',
  'Отдельный документ под каждую важную вакансию',
];

export const howMetrics = [
  { label: 'Позиционирование', value: 'Сильное', progress: '88%' },
  { label: 'Доказательность', value: 'Выше среднего', progress: '76%' },
  { label: 'ATS-совместимость', value: 'Высокая', progress: '91%' },
];
