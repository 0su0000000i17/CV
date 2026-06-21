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

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {settings.map((item) => (
          <label
            key={item}
            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-muted"
          >
            <input
              type="checkbox"
              defaultChecked
              className="mt-1 h-4 w-4 accent-foreground"
            />

            <span className="text-sm leading-relaxed text-foreground">
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
