export function HistoryHeader() {
  return (
    <div className="mb-10">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Личный кабинет / История
      </p>

      <h1 className="text-4xl font-normal tracking-tight text-foreground md:text-5xl">
        История
      </h1>

      <p className="mt-4 max-w-2xl text-muted-foreground">
        Здесь будет собираться вся активность: загрузки резюме, оценки,
        адаптации, скачивания и созданные версии.
      </p>
    </div>
  );
}
