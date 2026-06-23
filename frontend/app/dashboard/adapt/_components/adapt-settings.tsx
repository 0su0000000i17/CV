const settings = [
  'Сохранить стиль автора',
  'Усилить достижения',
  'Оптимизировать под ATS',
  'Подстроить навыки под вакансию',
  'Сделать текст более конкретным',
];

export function AdaptSettings() {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <h2 className="text-xl font-medium text-foreground">
        Настройки адаптации
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Эти параметры будут влиять на то, как сервис перепишет резюме.
      </p>

      <div className="mt-4 space-y-2">
        {settings.map((item) => (
          <label
            key={item}
            className="flex min-h-[40px] cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 transition-colors hover:bg-muted"
          >
            <input
              type="checkbox"
              defaultChecked
              className="h-3.5 w-3.5 shrink-0 accent-foreground"
            />

            <span className="text-sm leading-snug text-foreground">
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
