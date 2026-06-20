import { securityItems } from "../_data/settingsData";

export function SecuritySettings() {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <h2 className="text-xl font-medium text-foreground">Безопасность</h2>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Эти блоки пока являются UI-заглушками. Позже сюда подключим реальные
        данные аккаунта, сессии и доступы.
      </p>

      <div className="mt-6 space-y-3">
        {securityItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-background p-4"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-muted p-3">
                  <Icon className="h-4 w-4 text-foreground" />
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}