export function CoverLetterSidebar() {
  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <h2 className="font-medium text-foreground">Как это работает</h2>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Мы берём выбранное резюме, очищаем личные данные и используем только
            профессиональный контекст.
          </p>

          <p>
            Затем сопоставляем его с вакансией и пишем короткое письмо без
            выдуманных фактов.
          </p>

          <p>
            Контакты не отправляются в AI. Они добавляются отдельным блоком
            после генерации.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <p className="text-sm font-medium text-foreground">Совет</p>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Лучшее письмо — короткое. Оно должно показать релевантность, а не
          пересказать всё резюме.
        </p>
      </div>
    </aside>
  );
}