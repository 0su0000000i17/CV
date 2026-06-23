import { Pencil } from 'lucide-react';

import { EditorSection } from './editor-section';
import { SmallInput } from './form-controls';
import type { ContactDraft, ContactDraftSetter } from './types';

type Props = {
  contacts: ContactDraft;
  setContacts: ContactDraftSetter;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
};

export function ContactsSection({
  contacts,
  setContacts,
  isEditing,
  setIsEditing,
}: Props) {
  return (
    <EditorSection
      title="Контакты"
      description="Данные будут подтягиваться из профиля или исходного резюме. AI их не меняет."
    >
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <SmallInput
              label="ФИО"
              value={contacts.fullName}
              placeholder="Например: Иван Иванов"
              onChange={(fullName) =>
                setContacts((current) => ({ ...current, fullName }))
              }
            />

            <SmallInput
              label="Город"
              value={contacts.city}
              placeholder="Например: Москва"
              onChange={(city) => setContacts((current) => ({ ...current, city }))}
            />

            <SmallInput
              label="Телефон"
              value={contacts.phone}
              placeholder="+7..."
              onChange={(phone) =>
                setContacts((current) => ({ ...current, phone }))
              }
            />

            <SmallInput
              label="Email"
              value={contacts.email}
              placeholder="mail@example.com"
              onChange={(email) =>
                setContacts((current) => ({ ...current, email }))
              }
            />
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            Готово
          </button>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-2">
            {[
              ['ФИО', contacts.fullName || 'Не указано'],
              ['Телефон', contacts.phone || 'Не указано'],
              ['Email', contacts.email || 'Не указано'],
              ['Город', contacts.city || 'Не указано'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 truncate text-sm text-foreground">{value}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="shrink-0 rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Редактировать контакты"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      )}
    </EditorSection>
  );
}
