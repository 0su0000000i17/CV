import { Copy, FileText, RotateCcw } from 'lucide-react';

import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import type { UploadedResume } from '@/src/shared/api/resumes';
import type { ContactDraft } from '@/src/features/resume-editor/model/types';

import { ReplaceProfileResumeButton, SaveAdaptedResumeButton } from './save-button';

type Props = {
  accessToken?: string | null;
  contacts: ContactDraft;
  copyStatus: 'idle' | 'copied' | 'error';
  draft: ResumeAdaptationResult;
  onCopy: () => void;
  onProfileReplaced?: () => void;
  onReset: () => void;
  photoUrl: string | null;
  replaceProfileEnabled: boolean;
  resetButtonLabel: string;
  resetButtonVisible: boolean;
  sidebarDescription: string;
  sidebarTitle: string;
  sourceResume?: UploadedResume;
  vacancyText: string;
};

export function EditorSidebarCard(props: Props) {
  const copyLabel = props.copyStatus === 'copied'
    ? 'Скопировано'
    : props.copyStatus === 'error' ? 'Не скопировано' : 'Скопировать текст';
  const saveProps = {
    draft: props.draft,
    contacts: props.contacts,
    photoUrl: props.photoUrl,
    sourceResume: props.sourceResume,
    accessToken: props.accessToken,
    vacancyText: props.vacancyText,
  };
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-xl bg-brand-500/10 p-2.5 text-brand-300 ring-1 ring-brand-500/20">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <h2 className="font-medium text-foreground">{props.sidebarTitle}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{props.sidebarDescription}</p>
        </div>
      </div>
      <div className="space-y-2">
        {props.replaceProfileEnabled ? (
          <ReplaceProfileResumeButton {...saveProps} onSaved={props.onProfileReplaced} />
        ) : null}
        <SaveAdaptedResumeButton {...saveProps} />
        <button type="button" onClick={props.onCopy} className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted">
          <Copy className="h-4 w-4" />{copyLabel}
        </button>
        {props.resetButtonVisible ? (
          <button type="button" onClick={props.onReset} className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-300 transition-colors hover:bg-orange-500/15">
            <RotateCcw className="h-4 w-4" />{props.resetButtonLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
