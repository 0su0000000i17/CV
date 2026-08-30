import { BarChart3, Sparkles, Target } from 'lucide-react';

import { DashboardQuickAction } from './dashboard-quick-action';

export function DashboardActions(props: { analyze: string; improve: string; adapt: string }) {
  return (
    <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.018] p-3">
      <div className="px-3 pb-2 pt-2">
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/35">Быстрые действия</p>
      </div>
      <DashboardQuickAction href={props.analyze} title="Оценить резюме" description="Структура, ATS и слабые места" icon={<BarChart3 className="h-4 w-4" />} />
      <DashboardQuickAction href={props.improve} title="Улучшить формулировки" description="Сильнее подать опыт и результаты" icon={<Sparkles className="h-4 w-4" />} />
      <DashboardQuickAction href={props.adapt} title="Адаптировать" description="Подготовить версию под вакансию" icon={<Target className="h-4 w-4" />} />
    </aside>
  );
}
