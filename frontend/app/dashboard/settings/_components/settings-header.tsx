export function SettingsHeader() {
  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Личный кабинет / Настройки
      </p>

      <h1 className="text-4xl font-normal tracking-tight text-foreground md:text-5xl">
        Настройки
      </h1>

      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Основные данные аккаунта, тариф и управление текущей сессией.
      </p>
    </div>
  );
}