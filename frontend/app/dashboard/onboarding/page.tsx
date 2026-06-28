'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, User } from 'lucide-react';

import { useAuth } from '@/src/shared/hooks/use-auth';
import { useProfileQuery } from '@/src/shared/hooks/use-profile-query';
import { useUpdateProfileMutation } from '@/src/shared/hooks/use-update-profile-mutation';

const forbiddenNamePattern =
  /(еблан|дебил|идиот|мудак|пидор|пидр|хуй|хуе|бля|сука|сучка|шлюха|мразь|гандон|гондон|чмо|уеб|уёб)/i;

function validateName(value: string) {
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

export default function OnboardingPage() {
  const router = useRouter();
  const { accessToken, loading } = useAuth();
  const profileQuery = useProfileQuery(accessToken);
  const updateProfileMutation = useUpdateProfileMutation();
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const savedName = profileQuery.data?.profile.full_name.trim();

  useEffect(() => {
    if (savedName) {
      router.replace('/dashboard');
    }
  }, [router, savedName]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    if (!accessToken) {
      setErrorMessage('Сессия не найдена. Войдите в аккаунт повторно.');
      return;
    }

    const normalizedName = name.trim();
    const validationMessage = validateName(normalizedName);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    updateProfileMutation.mutate(
      { fullName: normalizedName, accessToken },
      {
        onSuccess: () => router.replace('/dashboard'),
        onError: (error) => {
          setErrorMessage(
            error instanceof Error ? error.message : 'Не удалось сохранить имя.'
          );
        },
      }
    );
  }

  if (loading || profileQuery.isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-160px)] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-5 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Подготавливаем профиль...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-xl items-center">
      <section className="w-full rounded-3xl border border-border bg-card/60 p-6 md:p-8">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/20">
          <User className="h-5 w-5" />
        </div>

        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Первый вход
        </p>

        <h1 className="text-3xl font-normal tracking-tight text-foreground md:text-4xl">
          Как к вам обращаться?
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Имя будет отображаться в личном кабинете. Фамилию указывать не нужно.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="onboarding-name" className="text-sm font-medium text-foreground">
              Имя
            </label>

            <input
              id="onboarding-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setErrorMessage('');
              }}
              maxLength={100}
              autoComplete="given-name"
              autoFocus
              placeholder="Например, Никита"
              className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-red-500" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateProfileMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {updateProfileMutation.isPending ? 'Сохраняем...' : 'Продолжить'}
          </button>
        </form>
      </section>
    </div>
  );
}
