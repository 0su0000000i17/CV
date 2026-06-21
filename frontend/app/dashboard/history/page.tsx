import { EventsList } from './_components/EventsList';
import { HistoryHeader } from './_components/HistoryHeader';
import { HistorySidebar } from './_components/HistorySidebar';
import { HistoryStats } from './_components/HistoryStats';

export default function HistoryPage() {
  return (
    <div>
      <HistoryHeader />
      <HistoryStats />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <EventsList />
        <HistorySidebar />
      </div>
    </div>
  );
}
