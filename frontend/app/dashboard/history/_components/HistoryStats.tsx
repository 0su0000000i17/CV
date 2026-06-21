const stats = [
  { label: 'Всего действий', value: '24' },
  { label: 'Создано версий', value: '6' },
  { label: 'Скачиваний', value: '8' },
];

export function HistoryStats() {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      {stats.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-border bg-card/60 p-5"
        >
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
