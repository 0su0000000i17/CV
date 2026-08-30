import type { ContactDraft } from '@/src/features/resume-editor/model/types';

import { ContactInfoField } from './contact-info-field';
import { ContactPhotoPreview } from './contact-photo-preview';

type Props = {
  contacts: ContactDraft;
  photoUrl: string | null;
};

export function ContactsDisplay({ contacts, photoUrl }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid items-start gap-3 sm:grid-cols-[112px_minmax(0,1fr)]">
        <ContactPhotoPreview photoUrl={photoUrl} />
        <div className="grid gap-2.5">
          <ContactInfoField label="ФИО" value={contacts.fullName} />
          <ContactInfoField label="Телефон" value={contacts.phone} />
        </div>
      </div>

      <div className="grid gap-2.5">
        <ContactInfoField label="Email" value={contacts.email} />
        <ContactInfoField label="Город" value={contacts.city} />
        <ContactInfoField label="Пол" value={contacts.gender} />
      </div>
    </div>
  );
}
