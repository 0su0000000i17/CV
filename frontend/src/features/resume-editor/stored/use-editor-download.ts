import { useState } from 'react';

import { normalizeResumeEditorDraft } from '@/src/features/resume-editor/model/normalizer';
import { useEditorState } from '@/src/features/resume-editor/model/use-editor-state';
import { exportAdaptedResumePdf, type AdaptedResumeExportContacts } from '@/src/shared/api/adapted-resume-export';
import type { UploadedResume } from '@/src/shared/api/resumes';
import { downloadBlob } from '@/src/shared/lib/download-blob';
import { createResumePdfFileName } from '@/src/shared/lib/resume-file-name';

export function useEditorDownload(
  resume: UploadedResume,
  accessToken: string,
  editor: ReturnType<typeof useEditorState>
) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  async function download() {
    if (!editor.draft) return;
    try {
      setStatus('loading');
      const blob = await exportAdaptedResumePdf({
        resumeId: resume.id,
        accessToken,
        payload: {
          sourceTitle: resume.file_name || resume.title,
          vacancyText: '',
          photoUrl: editor.photoUrl,
          contacts: editor.contacts as AdaptedResumeExportContacts,
          adaptation: normalizeResumeEditorDraft(editor.draft),
        },
      });
      const fileName = createResumePdfFileName(
        editor.contacts.fullName,
        resume.title,
        resume.file_name
      );
      downloadBlob(blob, fileName);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }

  return { download, status };
}
