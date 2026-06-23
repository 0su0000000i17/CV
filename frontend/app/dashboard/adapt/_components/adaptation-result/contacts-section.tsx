import { ContactsDisplay } from './contacts-display';
import { ContactsEditForm } from './contacts-edit-form';
import { EditorSection } from './editor-section';
import type { ContactDraft, ContactDraftSetter } from './types';

type Props = {
  contacts: ContactDraft;
  photoUrl: string | null;
  setContacts: ContactDraftSetter;
  setPhotoUrl: (photoUrl: string | null) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
};

export function ContactsSection({
  contacts,
  photoUrl,
  setContacts,
  setPhotoUrl,
  isEditing,
  setIsEditing,
}: Props) {
  return (
    <EditorSection
      title="Контакты"
      description="Данные подтягиваются из исходного резюме. AI их не меняет."
    >
      {isEditing ? (
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