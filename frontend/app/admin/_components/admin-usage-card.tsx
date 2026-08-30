import { eventLabels, formatAdminNumber } from './admin-overview-format';

type UsageEvent = { eventType: string; count: number };

export function AdminUsageCard({ title, events }: { title: string; events: UsageEvent[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm">
      <h2 className="text-lg font-medium tracking-tight text-foreground">{title}</h2>
      {events.length ? (
        <div className="mt-5 space-y-3">
          {events.map((event) => (
            <div key={event.eventType} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {eventLabels[event.eventType] ?? event.eventType}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {formatAdminNumber(event.count)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">Пока нет сохранённых событий.</p>
      )}
    </section>
  );
}
