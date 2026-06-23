'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  Loader2,
  Pencil,
  RotateCcw,
  Save,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type {
  ResumeAdaptationResponse,
  ResumeAdaptationResult,
} from '@/src/shared/api/resumeAdaptation';

type Props = {
  adaptationResponse?: ResumeAdaptationResponse;
  isAdapting: boolean;
  isError: boolean;
  errorMessage?: string;
  onResetAdaptation: () => void;
};

type ContactDraft = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
};

function cloneAdaptation(
  adaptation: ResumeAdaptationResult
): ResumeAdaptationResult {
  return JSON.parse(JSON.stringify(adaptation)) as ResumeAdaptationResult;
}

function listToText(items: string[]) {
  return items.join('\n');
}

function textToList(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getCompanyInitials(company?: string | null) {
  if (!company) {
    return 'CV';
  }

  const words = company
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return 'CV';
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}

function createPlainResumeText(
  adaptation: ResumeAdaptationResult,
  contacts: ContactDraft
) {
  const draft = adaptation.adaptedResume;
  const lines: string[] = [];

  lines.push(draft.headline);
  lines.push('');

  const contactLines = [
    contacts.fullName,
    contacts.phone,
    contacts.email,
    contacts.city,
  ].filter(Boolean);

  if (contactLines.length) {
    lines.push('Контакты');
    contactLines.forEach((item) => lines.push(item));
    lines.push('');
  }

  if (draft.experience.length) {
    lines.push('Опыт работы');

    draft.experience.forEach((item) => {
      lines.push('');

      const title = [item.position, item.company].filter(Boolean).join(' · ');
      const dates = item.dates ? ` / ${item.dates}` : '';

      lines.push(`${title}${dates}`.trim());

      if (item.focus) {
        lines.push(item.focus);
      }

      item.adaptedBullets.forEach((bullet) => {
        lines.push(`— ${bullet}`);
      });
    });

    lines.push('');
  }

  const skills = [...draft.skills.primary, ...draft.skills.secondary];

  if (skills.length) {
    lines.push('Навыки');
    lines.push(skills.join(', '));
    lines.push('');
  }

  if (draft.education.notes.length) {
    lines.push('Образование');
    draft.education.notes.forEach((item) => lines.push(`— ${item}`));
    lines.push('');
  }

  if (draft.summary) {
    lines.push('О себе');
    lines.push(draft.summary);
    lines.push('');
  }

  if (draft.additionalInfo.length) {
    lines.push('Дополнительная информация');
    draft.additionalInfo.forEach((item) => {
      lines.push(`— ${item}`);
    });
    lines.push('');
  }

  return lines.join('\n').trim();
}

function EditorSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="mb-4">
        <h2 className="text-2xl font-medium tracking-tight text-foreground">
          {title}
        </h2>

        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </section>
  );
}

function SmallInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-border bg-background/70 px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
      />
    </label>
  );
}

function TextArea({
  value,
  onChange,
  rows = 5,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full resize-y rounded-xl border border-border bg-background/70 px-4 py-3 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
    />
  );
}

function SideBlock({
  title,
  icon: Icon,
  items,
  tone = 'default',
}: {
  title: string;
  icon: LucideIcon;
  items: string[];
  tone?: 'default' | 'green' | 'orange';
}) {
  if (!items.length) {
    return null;
  }

  const iconClass =
    tone === 'green'
      ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20'
      : tone === 'orange'
        ? 'bg-orange-500/10 text-orange-300 ring-orange-500/20'
        : 'bg-muted text-foreground ring-border';

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className={`rounded-xl p-2 ring-1 ${iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>

        <h3 className="font-medium text-foreground">{title}</h3>
      </div>

      <div className="space-y-2.5">
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-start gap-3">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />

            <p className="text-sm leading-relaxed text-muted-foreground">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-muted p-3">
          <Loader2 className="h-5 w-5 animate-spin text-foreground" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">
            Создаём адаптацию
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Перепаковываем подтверждённый опыт под вакансию, усиливаем
            релевантные навыки и готовим черновик для проверки.
          </p>
        </div>
      </div>
    </section>
  );
}

function ErrorState({ errorMessage }: { errorMessage?: string }) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-red-500/10 p-3 text-red-300 ring-1 ring-red-500/20">
          <AlertCircle className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-medium text-foreground">
            Не удалось создать адаптацию
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {errorMessage ||
              'Попробуйте ещё раз. Если ошибка повторится, проверим backend-логи.'}
          </p>
        </div>
      </div>
    </section>
  );
}

export function AdaptationResultCard({
  adaptationResponse,
  isAdapting,
  isError,
  errorMessage,
  onResetAdaptation,
}: Props) {
  const [draft, setDraft] = useState<ResumeAdaptationResult | null>(null);
  const [contacts, setContacts] = useState<ContactDraft>({
    fullName: '',
    phone: '',
    email: '',
    city: '',
  });

  const [expandedExperienceIndexes, setExpandedExperienceIndexes] = useState<
    number[]
  >([]);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<
    number | null
  >(null);
  const [isContactsEditing, setIsContactsEditing] = useState(false);
  const [isSkillsEditing, setIsSkillsEditing] = useState(false);
  const [isEducationEditing, setIsEducationEditing] = useState(false);
  const [isAboutEditing, setIsAboutEditing] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle'
  );

  useEffect(() => {
    if (!adaptationResponse?.adaptation) {
      setDraft(null);
      return;
    }

    setDraft(cloneAdaptation(adaptationResponse.adaptation));
    setExpandedExperienceIndexes([]);
    setEditingExperienceIndex(null);
    setIsContactsEditing(false);
    setIsSkillsEditing(false);
    setIsEducationEditing(false);
    setIsAboutEditing(false);
  }, [adaptationResponse]);

  const plainResumeText = useMemo(() => {
    if (!draft) {
      return '';
    }

    return createPlainResumeText(draft, contacts);
  }, [contacts, draft]);

  if (isAdapting) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState errorMessage={errorMessage} />;
  }

  if (!adaptationResponse || !draft) {
    return null;
  }

  const allVisibleSkills = [
    ...draft.adaptedResume.skills.primary,
    ...draft.adaptedResume.skills.secondary,
  ];

  function updateDraft(updater: (current: ResumeAdaptationResult) => void) {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      const next = cloneAdaptation(current);
      updater(next);

      return next;
    });
  }

  function resetDraftToAiVersion() {
    if (!adaptationResponse?.adaptation) {
      return;
    }

    setDraft(cloneAdaptation(adaptationResponse.adaptation));
  }

  function toggleExpandedExperience(index: number) {
    setExpandedExperienceIndexes((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  }

  async function copyResumeText() {
    try {
      await navigator.clipboard.writeText(plainResumeText);
      setCopyStatus('copied');

      window.setTimeout(() => {
        setCopyStatus('idle');
      }, 1800);
    } catch {
      setCopyStatus('error');

      window.setTimeout(() => {
        setCopyStatus('idle');
      }, 1800);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <EditorSection title="Заголовок">
          <input
            value={draft.adaptedResume.headline}
            onChange={(event) =>
              updateDraft((current) => {
                current.adaptedResume.headline = event.target.value;
              })
            }
            className="h-12 w-full rounded-xl border border-border bg-background/70 px-4 text-lg font-medium text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
          />
        </EditorSection>

        <EditorSection
          title="Контакты"
          description="Данные будут подтягиваться из профиля или исходного резюме. AI их не меняет."
        >
          {isContactsEditing ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <SmallInput
                  label="ФИО"
                  value={contacts.fullName}
                  placeholder="Например: Иван Иванов"
                  onChange={(value) =>
                    setContacts((current) => ({
                      ...current,
                      fullName: value,
                    }))
                  }
                />

                <SmallInput
                  label="Город"
                  value={contacts.city}
                  placeholder="Например: Москва"
                  onChange={(value) =>
                    setContacts((current) => ({
                      ...current,
                      city: value,
                    }))
                  }
                />

                <SmallInput
                  label="Телефон"
                  value={contacts.phone}
                  placeholder="+7..."
                  onChange={(value) =>
                    setContacts((current) => ({
                      ...current,
                      phone: value,
                    }))
                  }
                />

                <SmallInput
                  label="Email"
                  value={contacts.email}
                  placeholder="mail@example.com"
                  onChange={(value) =>
                    setContacts((current) => ({
                      ...current,
                      email: value,
                    }))
                  }
                />
              </div>

              <button
                type="button"
                onClick={() => setIsContactsEditing(false)}
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
                    <p className="mt-1 truncate text-sm text-foreground">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsContactsEditing(true)}
                className="shrink-0 rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Редактировать контакты"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          )}
        </EditorSection>

        <EditorSection title="Опыт работы">
          <div className="divide-y divide-border">
            {draft.adaptedResume.experience.map((item, index) => {
              const isExpanded = expandedExperienceIndexes.includes(index);
              const isEditing = editingExperienceIndex === index;
              const companyInitials = getCompanyInitials(item.company);
              const bulletsText = listToText(item.adaptedBullets);

              return (
                <div
                  key={`${item.sourceIndex}-${item.company}-${item.position}`}
                  className="py-5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-xs font-medium text-muted-foreground">
                        {companyInitials}
                      </div>

                      <div className="mt-4 h-2 w-2 rounded-full bg-muted-foreground/50" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-medium text-foreground">
                            {item.company || 'Компания не указана'}
                          </h3>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.dates || 'Даты не указаны'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setEditingExperienceIndex(isEditing ? null : index)
                          }
                          className="shrink-0 rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Редактировать опыт"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium text-foreground">
                          {item.position || 'Должность не указана'}
                        </h4>

                        {isEditing ? (
                          <div className="mt-4 space-y-4">
                            <TextArea
                              value={item.focus || ''}
                              rows={3}
                              placeholder="Акцент блока"
                              onChange={(value) =>
                                updateDraft((current) => {
                                  const currentItem =
                                    current.adaptedResume.experience[index];

                                  if (!currentItem) {
                                    return;
                                  }

                                  currentItem.focus = value.trim()
                                    ? value
                                    : null;
                                })
                              }
                            />

                            <TextArea
                              value={bulletsText}
                              rows={8}
                              placeholder="Каждый пункт опыта — с новой строки"
                              onChange={(value) =>
                                updateDraft((current) => {
                                  const currentItem =
                                    current.adaptedResume.experience[index];

                                  if (!currentItem) {
                                    return;
                                  }

                                  currentItem.adaptedBullets = textToList(value);
                                })
                              }
                            />

                            <button
                              type="button"
                              onClick={() => setEditingExperienceIndex(null)}
                              className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                            >
                              Готово
                            </button>
                          </div>
                        ) : (
                          <>
                            <div
                              className={`mt-4 space-y-2.5 overflow-hidden text-sm leading-relaxed text-foreground ${
                                isExpanded ? '' : 'max-h-[190px]'
                              }`}
                            >
                              {item.focus ? (
                                <p className="text-muted-foreground">
                                  {item.focus}
                                </p>
                              ) : null}

                              {item.adaptedBullets.map((bullet, bulletIndex) => (
                                <p key={`${bullet}-${bulletIndex}`}>
                                  - {bullet}
                                </p>
                              ))}
                            </div>

                            {(item.adaptedBullets.length > 3 ||
                              Boolean(item.focus)) && (
                              <button
                                type="button"
                                onClick={() => toggleExpandedExperience(index)}
                                className="mt-3 inline-flex items-center gap-1 text-sm text-blue-400 transition-colors hover:text-blue-300"
                              >
                                {isExpanded ? 'Свернуть' : 'Развернуть'}
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </EditorSection>

        <EditorSection title="Навыки">
          {isSkillsEditing ? (
            <div className="space-y-4">
              <TextArea
                value={listToText(draft.adaptedResume.skills.primary)}
                rows={6}
                placeholder="Основные навыки, каждый с новой строки"
                onChange={(value) =>
                  updateDraft((current) => {
                    current.adaptedResume.skills.primary = textToList(value);
                  })
                }
              />

              <TextArea
                value={listToText(draft.adaptedResume.skills.secondary)}
                rows={6}
                placeholder="Дополнительные навыки, каждый с новой строки"
                onChange={(value) =>
                  updateDraft((current) => {
                    current.adaptedResume.skills.secondary = textToList(value);
                  })
                }
              />

              <button
                type="button"
                onClick={() => setIsSkillsEditing(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                Готово
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Продвинутый уровень
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSkillsEditing(true)}
                  className="shrink-0 rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Редактировать навыки"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {allVisibleSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-muted px-3 py-1.5 text-sm text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </EditorSection>

        <EditorSection title="Образование">
          {isEducationEditing ? (
            <div className="space-y-4">
              <TextArea
                value={listToText(draft.adaptedResume.education.notes)}
                rows={5}
                placeholder="Образование или комментарии по блоку"
                onChange={(value) =>
                  updateDraft((current) => {
                    current.adaptedResume.education.notes = textToList(value);
                  })
                }
              />

              <button
                type="button"
                onClick={() => setIsEducationEditing(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                Готово
              </button>
            </div>
          ) : (
            <div className="flex min-h-[110px] items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">
                  {draft.adaptedResume.education.policy === 'not_found'
                    ? 'Образование не найдено в исходном резюме.'
                    : 'Образование сохранено без изменений.'}
                </p>

                <div className="mt-3 max-h-[72px] space-y-2 overflow-hidden">
                  {draft.adaptedResume.education.notes.length ? (
                    draft.adaptedResume.education.notes.map((note) => (
                      <p
                        key={note}
                        className="text-sm leading-relaxed text-foreground"
                      >
                        {note}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Блок можно будет заполнить вручную перед сохранением
                      версии.
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEducationEditing(true)}
                className="shrink-0 rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Редактировать образование"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          )}
        </EditorSection>

        <EditorSection title="О себе">
          {isAboutEditing ? (
            <div className="space-y-4">
              <TextArea
                value={draft.adaptedResume.summary}
                rows={7}
                onChange={(value) =>
                  updateDraft((current) => {
                    current.adaptedResume.summary = value;
                  })
                }
              />

              <button
                type="button"
                onClick={() => setIsAboutEditing(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                Готово
              </button>
            </div>
          ) : (
            <div className="flex min-h-[120px] items-start justify-between gap-4">
              <p className="max-h-[84px] min-w-0 flex-1 overflow-hidden text-sm leading-relaxed text-foreground">
                {draft.adaptedResume.summary}
              </p>

              <button
                type="button"
                onClick={() => setIsAboutEditing(true)}
                className="shrink-0 rounded-xl border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Редактировать о себе"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          )}
        </EditorSection>
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-300 ring-1 ring-emerald-500/20">
              <FileText className="h-4 w-4" />
            </div>

            <div>
              <h2 className="font-medium text-foreground">
                Редактор адаптированного резюме
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Проверьте черновик и сохраните версию.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              disabled
              title="Сохранение версий подключим следующим шагом"
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background opacity-50"
            >
              <Save className="h-4 w-4" />
              Сохранить версию
            </button>

            <button
              type="button"
              onClick={copyResumeText}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <Copy className="h-4 w-4" />
              {copyStatus === 'copied'
                ? 'Скопировано'
                : copyStatus === 'error'
                  ? 'Не скопировано'
                  : 'Скопировать текст'}
            </button>

            <button
              type="button"
              onClick={resetDraftToAiVersion}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" />
              Вернуть AI-версию
            </button>

            <button
              type="button"
              onClick={onResetAdaptation}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-300 transition-colors hover:bg-orange-500/15"
            >
              <RotateCcw className="h-4 w-4" />
              Сбросить адаптацию
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4">
          <h3 className="font-medium text-foreground">Совет</h3>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Сначала проверьте опыт и навыки, потом summary. Так проще заметить,
            не добавилось ли лишнее.
          </p>
        </div>

        <SideBlock
          title="Что изменено"
          icon={Sparkles}
          items={draft.changes}
          tone="green"
        />

        <SideBlock
          title="Предупреждения"
          icon={TriangleAlert}
          items={draft.warnings}
          tone="orange"
        />

        <SideBlock
          title="Что не было добавлено"
          icon={AlertCircle}
          items={draft.forbiddenClaims}
          tone="orange"
        />
      </aside>
    </div>
  );
}