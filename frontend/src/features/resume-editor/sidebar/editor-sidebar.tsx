import {
  AlertCircle,
  Sparkles,
  TrendingUp,
  TriangleAlert,
} from 'lucide-react';

import { CoverLetterPanel } from '@/src/features/resume-editor/cover-letter/panel';
import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import type { UploadedResume } from '@/src/shared/api/resumes';
import type { ContactDraft } from '@/src/features/resume-editor/model/types';

import { SideBlock } from './list-block';
import { EditorSidebarCard } from './editor-sidebar-card';

type Props = {
  draft: ResumeAdaptationResult;
  contacts: ContactDraft;
  photoUrl: string | null;
  sourceResume?: UploadedResume;
  accessToken?: string | null;
  vacancyText: string;
  copyStatus: 'idle' | 'copied' | 'error';
  sidebarTitle?: string;
  sidebarDescription?: string;
  resetButtonLabel?: string;
  resetButtonVisible?: boolean;
  coverLetterEnabled?: boolean;
  replaceProfileEnabled?: boolean;
  onProfileReplaced?: () => void;
  onCopyResumeText: () => void;
  onResetAdaptation: () => void;
};

export function EditorSidebar({
  draft,
  contacts,
  photoUrl,
  sourceResume,
  accessToken,
  vacancyText,
  copyStatus,
  sidebarTitle = 'Редактор адаптированного резюме',
  sidebarDescription = 'Проверьте черновик и сохраните готовый PDF.',
  resetButtonLabel = 'Сбросить адаптацию',
  resetButtonVisible = true,
  coverLetterEnabled = true,
  replaceProfileEnabled = false,
  onProfileReplaced,
  onCopyResumeText,
  onResetAdaptation,
}: Props) {
  return (
    <aside className="space-y-4">
      <EditorSidebarCard
        accessToken={accessToken}
        contacts={contacts}
        copyStatus={copyStatus}
        draft={draft}
        onCopy={onCopyResumeText}
        onProfileReplaced={onProfileReplaced}
        onReset={onResetAdaptation}
        photoUrl={photoUrl}
        replaceProfileEnabled={replaceProfileEnabled}
        resetButtonLabel={resetButtonLabel}
        resetButtonVisible={resetButtonVisible}
        sidebarDescription={sidebarDescription}
        sidebarTitle={sidebarTitle}
        sourceResume={sourceResume}
        vacancyText={vacancyText}
      />

      {coverLetterEnabled ? (
        <CoverLetterPanel
          draft={draft}
          sourceResume={sourceResume}
          accessToken={accessToken}
          vacancyText={vacancyText}
        />
      ) : null}

      <SideBlock title="Что изменено" icon={Sparkles} items={draft.changes} />
      <SideBlock
        title="Предупреждения"
        icon={TriangleAlert}
        items={draft.warnings}
        tone="orange"
      />
      <SideBlock
        title="Уточните цифры"
        icon={TrendingUp}
        items={draft.metricGaps}
        tone="orange"
      />
      <SideBlock
        title="Что не было добавлено"
        icon={AlertCircle}
        items={draft.forbiddenClaims}
        tone="orange"
      />
    </aside>
  );
}
