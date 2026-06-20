import Link from "next/link";
import { BarChart3, WandSparkles, History } from "lucide-react";

type Props = {
  resumeId: string;
};

const actions = [
  {
    title: "Запустить анализ",
    description: "Получить оценку резюме и рекомендации.",
    href: "/dashboard/analyze",
    icon: BarChart3,
  },
  {
    title: "Адаптировать под вакансию",
    description: "Создать версию под конкретное описание.",
    href: "/dashboard/adapt",
    icon: WandSparkles,
  },
  {
    title: "Посмотреть историю",
    description: "Открыть действия и изменения по резюме.",
    href: "/dashboard/history",
    icon: History,
  },
];

export function ResumeActionsPanel({ resumeId }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <h2 className="text-xl font-medium text-foreground">
        Что можно сделать дальше
      </h2>

      <div className="mt-5 space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={`${action.href}?resumeId=${resumeId}`}
              className="flex items-start gap-4 rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-muted"
            >
              <div className="rounded-xl bg-muted p-3">
                <Icon className="h-5 w-5 text-foreground" />
              </div>

              <div>
                <p className="font-medium text-foreground">{action.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}