import { User } from "lucide-react";

import { profileSettings } from "../_data/settingsData";

export function ProfileSettings() {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="mb-6 flex items-start gap-4">
        <div className="rounded-xl bg-muted p-3">
          <User className="h-5 w-5 text-foreground" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">Профиль</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Базовые данные аккаунта.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {profileSettings.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-4"
          >
            <div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-1 font-medium text-foreground">{item.value}</p>
            </div>

            <button className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
              Изменить
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}