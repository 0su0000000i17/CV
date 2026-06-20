import { Download, SearchCheck, Sparkles, Upload } from "lucide-react";

const events = [
  {
    id: "1",
    title: "Загружено резюме",
    description: "Frontend Developer Resume.pdf",
    date: "Сегодня, 14:20",
    icon: Upload,
  },
  {
    id: "2",
    title: "Запущена оценка резюме",
    description: "Product Manager Resume.pdf получил оценку 78/100",
    date: "Вчера, 18:10",
    icon: SearchCheck,
  },
  {
    id: "3",
    title: "Создана адаптация",
    description: "Версия под вакансию Middle Frontend Developer",
    date: "15 июня, 11:45",
    icon: Sparkles,
  },
  {
    id: "4",
    title: "Скачан файл",
    description: "Frontend Developer Resume — React Version.docx",
    date: "14 июня, 09:32",
    icon: Download,
  },
];

export function EventsList() {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <h2 className="text-xl font-medium text-foreground">
        Последние действия
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Хронология действий в личном кабинете.
      </p>

      <div className="mt-6 space-y-4">
        {events.map((event) => {
          const Icon = event.icon;

          return (
            <div
              key={event.id}
              className="flex gap-4 rounded-2xl border border-border bg-background p-5"
            >
              <div className="h-fit rounded-xl bg-muted p-3">
                <Icon className="h-5 w-5 text-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                  <div>
                    <p className="font-medium text-foreground">
                      {event.title}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  </div>

                  <p className="shrink-0 text-xs text-muted-foreground">
                    {event.date}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}