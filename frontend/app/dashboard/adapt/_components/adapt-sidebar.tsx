import type { ResumeAdaptationResponse } from '@/src/shared/api/resume-adaptation';
import type { ResumeVacancyFitResponse } from '@/src/shared/api/resume-vacancy-fit';

import { SidebarActionButton } from './adapt-sidebar/sidebar-action-button';
import { SidebarHeader } from './adapt-sidebar/sidebar-header';
import { SidebarResultList } from './adapt-sidebar/sidebar-result-list';
import { SidebarStatusMessages } from './adapt-sidebar/sidebar-status-messages';

type Props = {
  fitResponse?: ResumeVacancyFitResponse;
  adaptationResponse?: ResumeAdaptationResponse;
  isAdapting: boolean;
  isCheckingFit: boolean;
  onCreateAdaptation: () => void;
};

export function AdaptSidebar(props: Props) {
  const {
    fitResponse,
    adaptationResponse,
    isAdapting,
    isCheckingFit,
    onCreateAdaptation,
  } = props;

  const canContinue = fitResponse?.fit.canAdapt === true;
  const hasAdaptation = Boolean(adaptationResponse);
  const hasFitResult = Boolean(fitResponse);

  return (
    <aside>
      <div className="rounded-2xl border border-white/10 bg-white/[0.018] p-5">
        <SidebarHeader
          canContinue={canContinue}
          isCheckingFit={isCheckingFit}
        />
        <SidebarResultList />
        <SidebarStatusMessages
          hasFitResult={hasFitResult}
          canContinue={canContinue}
          isCheckingFit={isCheckingFit}
        />
        <SidebarActionButton
          canContinue={canContinue}
          hasAdaptation={hasAdaptation}
          isAdapting={isAdapting}
          onCreateAdaptation={onCreateAdaptation}
        />
      </div>
    </aside>
  );
}
