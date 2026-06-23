import { PhotoControl } from './photo-control';
import { SmallInput } from './form-controls';
import type { ContactDraft, ContactDraftSetter } from './types';

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
        <SmallInput
          label="ФИО"
          value={contacts.fullName}
          onChange={(value) => updateContactField('fullName', value)}
        />

        <SmallInput
          label="Телефон"
          value={contacts.phone}
          onChange={(value) => updateContactField('phone', value)}
        />

        <SmallInput
          label="Email"
          value={contacts.email}
          onChange={(value) => updateContactField('email', value)}
        />

        <SmallInput
          label="Город"
          value={contacts.city}
          onChange={(value) => updateContactField('city', value)}
        />

        <SmallInput
          label="Пол"
          value={contacts.gender}
          onChange={(value) => updateContactField('gender', value)}
        />

        <SmallInput
          label="Возраст"
          value={contacts.age}
          onChange={(value) => updateContactField('age', value)}
        />

        <SmallInput
          label="Дата рождения"
          value={contacts.birthDate}
          onChange={(value) => updateContactField('birthDate', value)}
        />

        <SmallInput
          label="Гражданство"
          value={contacts.citizenship}
          onChange={(value) => updateContactField('citizenship', value)}
        />

        <SmallInput
          label="Разрешение на работу"
          value={contacts.workPermit}
          onChange={(value) => updateContactField('workPermit', value)}
        />

        <SmallInput
          label="Переезд"
          value={contacts.relocation}
          onChange={(value) => updateContactField('relocation', value)}
        />

        <SmallInput
          label="Командировки"
          value={contacts.businessTrips}
          onChange={(value) => updateContactField('businessTrips', value)}
        />
      </div>

      <button
        type="button"
        onClick={onDone}
        className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
      >
        Готово
      </button>
    </div>
  );
}