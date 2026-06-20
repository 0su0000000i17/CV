import { futureSettings } from "../_data/settingsData";

export function FutureSettings() {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <h2 className="text-xl font-medium text-foreground">
        Будущие настройки
      </h2>

      <div className="mt-5 space-y-3 text-sm text-muted-foreground">
        {futureSettings.map((item) => (
          <p key={item}>— {item}</p>
        ))}
      </div>
    </section>
  );
}