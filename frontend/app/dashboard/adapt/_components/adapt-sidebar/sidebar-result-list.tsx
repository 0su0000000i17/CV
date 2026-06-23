import { CheckCircle2 } from 'lucide-react';

const resultItems = [
  'Заголовок и summary',
  'Опыт под вакансию',
  'Релевантные навыки',
  'Ограничения адаптации',
];

export function SidebarResultList() {
  return (
    <div className="space-y-2">
      {resultItems.map((item) => (
        <div key={item} className="flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
          <p className="text-sm text-muted-foreground">{item}</p>
        </div>
      ))}
    </div>
  );
}
