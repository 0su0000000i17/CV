import { EditorSection } from '@/src/features/resume-editor/ui/editor-section';
import type {
  ContactDraft,
  ContactDraftSetter,
} from '@/src/features/resume-editor/model/types';

import { ContactsDisplay } from './contacts-display';
import { ContactsEditForm } from './contacts-edit-form';
import { ContactsSectionSkeleton } from './contacts-section-skeleton';

type Props = {
  contacts: ContactDraft;
  photoUrl: string | null;
  setContacts: ContactDraftSetter;
  setPhotoUrl: (photoUrl: string | null) => void;
  isEditing: boolean;
  isProfileLoading: boolean;
  setIsEditing: (value: boolean) => void;
};

export function ContactsSection({
  contacts,
  photoUrl,
  setContacts,
  setPhotoUrl,
  isEditing,
  isProfileLoading,
  setIsEditing,
}: Props) {
  return (
    <EditorSection
      title="Контакты"
      description="Данные подтягиваются из исходного резюме. AI их не меняет."
    >
      {isProfileLoading ? (
        <ContactsSectionSkeleton />
      ) : isEditing ? (
        <ContactsEditForm
          contacts={contacts}
          photoUrl={photoUrl}
          setContacts={setContacts}
          setPhotoUrl={setPhotoUrl}
          onDone={() => setIsEditing(false)}
        />
      ) : (
        <ContactsDisplay
          contacts={contacts}
          photoUrl={photoUrl}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </EditorSection>
  );
}
