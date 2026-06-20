import { preferenceItems } from "../_data/settingsData";

export function PreferenceSettings() {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <h2 className="text-xl font-medium text-foreground">Предпочтения</h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Эти настройки будут влиять на будущие анализы и адаптации резюме.
      </p>

      <div className="mt-6 space-y-3">
        {preferenceItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-background p-5"
            >
              <div className="flex gap-4">
                <div className="h-fit rounded-xl bg-muted p-3">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>

                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Сейчас: {item.value}
                  </p>
                </div>
              </div>

              <button className="shrink-0 rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
                Настроить
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}