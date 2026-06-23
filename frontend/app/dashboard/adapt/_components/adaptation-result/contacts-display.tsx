import { Pencil } from 'lucide-react';

import { ContactInfoField } from './contact-info-field';
import { ContactPhotoPreview } from './contact-photo-preview';
import type { ContactDraft } from './types';

type Props = {
  contacts: ContactDraft;
  photoUrl: string | null;
  onEdit: () => void;
};

export function ContactsDisplay({ contacts, photoUrl, onEdit }: Props) {
  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_96px] md:items-start">
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <ContactInfoField label="ФИО" value={contacts.fullName} />
          <ContactInfoField label="Телефон" value={contacts.phone} />
          <ContactInfoField label="Email" value={contacts.email} />
          <ContactInfoField label="Город" value={contacts.city} />
          <ContactInfoField label="Пол" value={contacts.gender} />
          <ContactInfoField label="Возраст" value={contacts.age} />
          <ContactInfoField label="Дата рождения" value={contacts.birthDate} />
          <ContactInfoField label="Гражданство" value={contacts.citizenship} />
          <ContactInfoField
            label="Разрешение на работу"
            value={contacts.workPermit}
          />
          <ContactInfoField label="Переезд" value={contacts.relocation} />
          <ContactInfoField
            label="Командировки"
            value={contacts.businessTrips}
          />
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
          Редактировать контакты и фото
        </button>
      </div>

      <div className="-mt-1 justify-self-start md:-mt-10 md:justify-self-end">
        <ContactPhotoPreview photoUrl={photoUrl} />
      </div>
    </div>
  );
}