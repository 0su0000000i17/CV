import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import {
  updateResumeText,
  type ResumeTextResponse,
} from '@/src/shared/api/resumes';

import type { ContactDraft } from '@/src/features/resume-editor/model/types';

type UpdateResumeTextVariables = {
  resumeId: string;
  resumeJson: ResumeAdaptationResult;
  contacts: ContactDraft;
  photoUrl: string | null;
  accessToken: string;
};

function updateCachedPhoto(document: ResumeTextResponse['document'], photoUrl: string | null) {
  if (!document || typeof document !== 'object') return document;

  const currentPhoto = (document as { photo?: unknown }).photo;
  const keepSize =
    photoUrl &&
    typeof currentPhoto === 'object' &&
    currentPhoto !== null &&
    (currentPhoto as { dataUrl?: unknown }).dataUrl === photoUrl;

  return {
    ...document,
    photo: photoUrl
      ? {
          contentType: getPhotoContentType(photoUrl),
          dataUrl: photoUrl,
          displayWidth: keepSize
            ? ((currentPhoto as { displayWidth?: unknown }).displayWidth ?? null)
            : null,
          displayHeight: keepSize
            ? ((currentPhoto as { displayHeight?: unknown }).displayHeight ?? null)
            : null,
        }
      : null,
  };
}

function getPhotoContentType(photoUrl: string) {
  const match = photoUrl.match(/^data:([^;,]+)[;,]/i);

  return match?.[1] || 'image/png';
}

export function useUpdateResumeTextMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdateResumeTextVariables) =>
      updateResumeText(variables),

    onSuccess: (_, variables) => {
      queryClient.setQueryData<ResumeTextResponse>(
        ['resume-text', variables.resumeId],
        (current) => ({
          status: 'ok',
          resumeId: variables.resumeId,
          source: 'saved_json',
          markdown: current?.markdown ?? '',
          resumeJson: variables.resumeJson,
          contacts: variables.contacts,
          document: updateCachedPhoto(current?.document, variables.photoUrl),
          stats: current?.stats ?? null,
          extractor: {
            mode: 'saved_json',
            provider: null,
            model: null,
          },
        })
      );

      queryClient.invalidateQueries({
        queryKey: ['resume', variables.resumeId],
      });

      queryClient.invalidateQueries({
        queryKey: ['resumes'],
      });

      // The stored analysis now describes the pre-save content - refetch so
      // the analyze page immediately sees it flagged stale instead of showing
      // the old score/breakdown as current.
      queryClient.invalidateQueries({
        queryKey: ['resume-analysis', variables.resumeId],
      });
    },
  });
}
