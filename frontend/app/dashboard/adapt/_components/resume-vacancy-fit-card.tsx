import type { ResumeVacancyFitResponse } from '@/src/shared/api/resume-vacancy-fit';

import { FitInfo } from './vacancy-fit/fit-info';
import { FitResultCallout } from './vacancy-fit/fit-result-callout';
import { FitSummary } from './vacancy-fit/fit-summary';
import {
  FitCheckingState,
  FitEmptyState,
  FitErrorState,
} from './vacancy-fit/fit-states';
import { RiskFlags } from './vacancy-fit/risk-flags';

type Props = {
  fitResponse?: ResumeVacancyFitResponse;
  isChecking: boolean;
  isError: boolean;
  errorMessage?: string;
};

export function ResumeVacancyFitCard(props: Props) {
  const { fitResponse, isChecking, isError, errorMessage } = props;

  if (isChecking) {
    return <FitCheckingState />;
  }

  if (isError) {
    return <FitErrorState errorMessage={errorMessage} />;
  }

  if (!fitResponse) {
    return <FitEmptyState />;
  }

  const fit = fitResponse.fit;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.018] p-5 sm:p-6">
      <FitSummary fit={fit} />
      <FitInfo fit={fit} />
      <RiskFlags riskFlags={fit.riskFlags} />
      <FitResultCallout canAdapt={fit.canAdapt} />
    </section>
  );
}
