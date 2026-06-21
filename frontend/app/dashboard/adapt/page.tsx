import { AdaptHeader } from './_components/AdaptHeader';
import { AdaptSettings } from './_components/AdaptSettings';
import { AdaptSidebar } from './_components/AdaptSidebar';
import { SelectedResumeCard } from './_components/SelectedResumeCard';
import { VacancyForm } from './_components/VacancyForm';

export default function AdaptPage() {
  return (
    <div>
      <AdaptHeader />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <SelectedResumeCard />
          <VacancyForm />
          <AdaptSettings />
        </div>

        <AdaptSidebar />
      </div>
    </div>
  );
}
