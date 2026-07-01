import type { SourceResumeDocument } from '@/src/shared/api/resumes';
import { normalizeResumeEditorDraft } from '@/src/features/resume-editor/model/normalizer';
import type { ContactDraft } from '@/src/features/resume-editor/model/types';

export function createEditorSnapshot(
  draft: ReturnType<typeof normalizeResumeEditorDraft>,
  contacts: ContactDraft,
  photoUrl: string | null
) {
  return JSON.stringify({
    draft,
    contacts,
    photoUrl,
  });
}

export function getStoredPhotoUrl(document?: SourceResumeDocument | null) {
  const photo = document?.['photo'];
  if (!photo || typeof photo !== 'object') return null;

  const dataUrl = (photo as { dataUrl?: unknown }).dataUrl;
  return typeof dataUrl === 'string' && dataUrl.trim() ? dataUrl : null;
}
