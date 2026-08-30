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

  const stored = photo as {
    dataUrl?: unknown;
    displayWidth?: unknown;
    displayHeight?: unknown;
  };
  const width = Number(stored.displayWidth) || 0;
  const height = Number(stored.displayHeight) || 0;
  if (width && height && (width < 45 || height < 45)) return null;
  const dataUrl = stored.dataUrl;
  return typeof dataUrl === 'string' && dataUrl.trim() ? dataUrl : null;
}
