import { FileSearch } from 'lucide-react';

import type { UploadedResume } from '@/src/shared/api/resumes';

import { ActionLink } from './resume-actions/action-link';
import { createActionItems } from './resume-actions/action-items';

type Props = {
  resume: UploadedResume;
};

export function ResumeActionsPanel({ resume }: Props) {
  const actions = createActionItems(resume);

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-brand-500/10 p-2.5 text-brand-300 ring-1 ring-brand-500/20">
          <FileSearch className="h-5 w-5" />
        </div>

        <h2 className="text-xl font-medium text-foreground">
          Что можно сделать дальше
        </h2>
      </div>

      <div className="mt-5 space-y-3">
        {actions.map((action) => (
          <ActionLink key={action.title} action={action} />
        ))}
      </div>
    </div>
  );
}
