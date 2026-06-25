import { SmallInput } from '@/src/features/resume-editor/ui/form-controls';
import type {
  ContactDraft,
  ContactDraftSetter,
} from '@/src/features/resume-editor/model/types';

import { PhotoControl } from './photo-control';

const contactFields: Array<{ key: keyof ContactDraft; label: string }> = [
  { key: 'fullName', label: 'ФИО' },
  { key: 'phone', label: 'Телефон' },
  { key: 'email', label: 'Email' },
  { key: 'city', label: 'Город' },
  { key: 'gender', label: 'Пол' },
  { key: 'age', label: 'Возраст' },
  { key: 'birthDate', label: 'Дата рождения' },
  { key: 'citizenship', label: 'Гражданство' },
  { key: 'workPermit', label: 'Разрешение на работу' },
  { key: 'relocation', label: 'Переезд' },
  { key: 'businessTrips', label: 'Командировки' },
];

type Props = {
  contacts: ContactDraft;
  photoUrl: string | null;
  setContacts: ContactDraftSetter;
  setPhotoUrl: (photoUrl: string | null) => void;
  onDone: () => void;
};

export function ContactsEditForm({
  contacts,
  photoUrl,
  setContacts,
  setPhotoUrl,
  onDone,
}: Props) {
  function updateContactField(field: keyof ContactDraft, value: string) {
    setContacts((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <div className="space-y-5">
      <PhotoControl photoUrl={photoUrl} onChangePhoto={setPhotoUrl} />

      <div className="grid gap-4 md:grid-cols-2">
        {contactFields.map((field) => (
          <SmallInput
            key={field.key}
            label={field.label}
            value={contacts[field.key]}
            onChange={(value) => updateContactField(field.key, value)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onDone}
        className="cursor-pointer rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
      >
        Готово
      </button>
    </div>
  );
}
