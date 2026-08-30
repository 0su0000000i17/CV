import { EditorSection } from '@/src/features/resume-editor/ui/editor-section';
import type { ContactDraft } from '@/src/features/resume-editor/model/types';

import { ContactsDisplay } from './contacts-display';
import { ContactsSectionSkeleton } from './contacts-section-skeleton';

type Props = {
  contacts: ContactDraft;
  photoUrl: string | null;
  isProfileLoading: boolean;
};

export function ContactsSection({ contacts, photoUrl, isProfileLoading }: Props) {
  return (
    <EditorSection
      title="Контакты"
      description="Данные подтягиваются из исходного резюме."
    >
      {isProfileLoading ? (
        <ContactsSectionSkeleton />
      ) : (
        <ContactsDisplay contacts={contacts} photoUrl={photoUrl} />
      )}
    </EditorSection>
  );
}
