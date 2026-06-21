'use client';

import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Mail, User, WalletCards } from 'lucide-react';

import type { Profile } from '@/src/shared/api/profile';
import { useProfileQuery } from '@/src/shared/hooks/useProfileQuery';
import { useUpdateProfileMutation } from '@/src/shared/hooks/useUpdateProfileMutation';
import { supabase } from '@/src/shared/lib/supabase/client';

const forbiddenNamePattern =
  /(еблан|дебил|идиот|мудак|пидор|пидр|хуй|хуе|бля|сука|сучка|шлюха|мразь|гандон|гондон|чмо|уеб|уёб)/i;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateFullName(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return 'Введите имя.';
  }

  if (normalizedValue.length > 100) {
    return 'Имя не должно превышать 100 символов.';
  }

  if (forbiddenNamePattern.test(normalizedValue)) {
    return 'Введите корректное имя.';
  }

  return '';
}

export function ProfileSettings() {
  const [accessToken, setAccessToken] = useState<string>();
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAccessToken(data.session?.access_token);
      setSessionLoading(false);
    });
  }, []);

  const profileQuery = useProfileQuery(accessToken);
  const profile = profileQuery.data?.profile;

  if (sessionLoading || profileQuery.isLoading) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="h-7 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-6 h-40 animate-pulse rounded-2xl bg-muted" />
        </section>

        <section className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="h-7 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-20 animate-pulse rounded-2xl bg-muted" />
        </section>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <section className="rounded-2xl border border-red-500/30 bg-card/60 p-6 text-sm text-red-500">
        Сессия не найдена. Войдите в аккаунт повторно.
      </section>
    );
  }

  if (profileQuery.isError) {
    return (
      <section className="rounded-2xl border border-red-500/30 bg-card/60 p-6">
        <p className="text-sm text-red-500">
          {profileQuery.error instanceof Error
            ? profileQuery.error.message
            : 'Не удалось загрузить профиль.'}
        </p>

        <button
          type="button"
          onClick={() => profileQuery.refetch()}
          className="mt-4 rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
        >
          Повторить
        </button>
      </section>
    );
  }

  if (!profile) {
    return null;
  }

  return <ProfileForms profile={profile} accessToken={accessToken} />;
}

type ProfileFormsProps = {
  profile: Profile;
  accessToken: string;
};

function ProfileForms({ profile, accessToken }: ProfileFormsProps) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [email, setEmail] = useState(profile.email);
  const [nameMessage, setNameMessage] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailUpdating, setEmailUpdating] = useState(false);

  const updateProfileMutation = useUpdateProfileMutation();

  useEffect(() => {
    setFullName(profile.full_name);
    setEmail(profile.email);
  }, [profile.full_name, profile.email]);

  const normalizedCurrentName = useMemo(
    () => profile.full_name.trim(),
    [profile.full_name]
  );

  const normalizedDraftName = fullName.trim();
  const normalizedCurrentEmail = profile.email.trim().toLowerCase();
  const normalizedDraftEmail = email.trim().toLowerCase();

  const draftNameValidationMessage = validateFullName(normalizedDraftName);

  const hasNameChanges = normalizedDraftName !== normalizedCurrentName;
  const hasEmailChanges = normalizedDraftEmail !== normalizedCurrentEmail;

  const canSubmitName =
    hasNameChanges &&
    !draftNameValidationMessage &&
    !updateProfileMutation.isPending;

  const canSubmitEmail =
    hasEmailChanges &&
    normalizedDraftEmail.length > 0 &&
    isValidEmail(normalizedDraftEmail) &&
    !emailUpdating;

  const handleNameSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNameError('');
    setNameMessage('');

    if (!hasNameChanges) {
      return;
    }

    const validationMessage = validateFullName(normalizedDraftName);

    if (validationMessage) {
      setNameError(validationMessage);
      return;
    }

    updateProfileMutation.mutate(
      { fullName: normalizedDraftName, accessToken },
      {
        onSuccess: () => {
          setFullName(normalizedDraftName);
          setNameMessage('Имя изменено.');
        },
        onError: (error) => {
          setNameError(
            error instanceof Error ? error.message : 'Не удалось изменить имя.'
          );
        },
      }
    );
  };

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError('');
    setEmailMessage('');

    if (!hasEmailChanges) {
      return;
    }

    if (!normalizedDraftEmail) {
      setEmailError('Введите email.');
      return;
    }

    if (!isValidEmail(normalizedDraftEmail)) {
      setEmailError('Введите корректный email.');
      return;
    }

    setEmailUpdating(true);

    const { error } = await supabase.auth.updateUser(
      { email: normalizedDraftEmail },
      {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
      }
    );

    setEmailUpdating(false);

    if (error) {
      setEmailError(error.message);
      return;
    }

    setEmail(normalizedDraftEmail);
    setEmailMessage(
      'Письмо отправлено. Подтвердите новый email по ссылке из письма.'
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="mb-6 flex items-start gap-4">
          <div className="rounded-xl bg-muted p-3">
            <User className="h-5 w-5 text-foreground" />
          </div>

          <div>
            <h2 className="text-xl font-medium text-foreground">Профиль</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Управляйте именем и email вашего аккаунта.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <form
            onSubmit={handleNameSubmit}
            className="rounded-2xl border border-border bg-background p-5"
          >
            <label
              htmlFor="full-name"
              className="text-sm font-medium text-foreground"
            >
              Имя
            </label>

            <p className="mt-1 text-xs text-muted-foreground">
              Это имя будет отображаться в личном кабинете и минипрофиле.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(event) => {
                  setFullName(event.target.value);
                  setNameError('');
                  setNameMessage('');
                }}
                maxLength={100}
                autoComplete="name"
                className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-foreground"
              />

              <button
                type="submit"
                disabled={!canSubmitName}
                className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? 'Изменяем...' : 'Изменить'}
              </button>
            </div>

            <p className="mt-3 min-h-5 text-xs" aria-live="polite">
              {nameError ? (
                <span className="text-red-500">{nameError}</span>
              ) : nameMessage ? (
                <span className="text-emerald-500">{nameMessage}</span>
              ) : null}
            </p>
          </form>

          <form
            onSubmit={handleEmailSubmit}
            className="rounded-2xl border border-border bg-background p-5"
          >
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />

              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              После изменения нужно подтвердить новый адрес по ссылке из письма.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailError('');
                  setEmailMessage('');
                }}
                autoComplete="email"
                className="min-w-0 flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-foreground"
              />

              <button
                type="submit"
                disabled={!canSubmitEmail}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                {emailUpdating ? 'Отправляем...' : 'Изменить email'}
              </button>
            </div>

            <p className="mt-3 min-h-5 text-xs" aria-live="polite">
              {emailError ? (
                <span className="text-red-500">{emailError}</span>
              ) : emailMessage ? (
                <span className="text-emerald-500">{emailMessage}</span>
              ) : null}
            </p>
          </form>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-muted p-3">
              <WalletCards className="h-5 w-5 text-foreground" />
            </div>

            <div>
              <h2 className="text-xl font-medium text-foreground">Тариф</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Сейчас аккаунт работает на бесплатном тарифе.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
            <span className="text-sm text-muted-foreground">Текущий тариф</span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-500">
              Free
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-background p-5">
          <p className="text-sm font-medium text-foreground">
            Pro появится позже
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Платный тариф подключим ближе к продакшену, когда будут готовы
            анализ резюме, адаптация под вакансии и история версий.
          </p>
        </div>
      </section>
    </div>
  );
}
