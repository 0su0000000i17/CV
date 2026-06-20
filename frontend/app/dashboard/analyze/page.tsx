import { AnalyzeHeader } from "./_components/AnalyzeHeader";
import { AnalyzeSidebar } from "./_components/AnalyzeSidebar";
import { ChecksGrid } from "./_components/ChecksGrid";
import { FutureResultCard } from "./_components/FutureResultCard";
import { SelectedResumeCard } from "./_components/SelectedResumeCard";

export default function AnalyzePage() {
  return (
    <div>
      <AnalyzeHeader />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <SelectedResumeCard />
          <ChecksGrid />
          <FutureResultCard />
        </div>

        <AnalyzeSidebar />
      </div>
    </div>
  );
}