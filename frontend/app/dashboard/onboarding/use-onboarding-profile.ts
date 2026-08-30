import { type FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/src/shared/hooks/use-auth';
import { useProfileQuery } from '@/src/shared/hooks/use-profile-query';
import { useUpdateProfileMutation } from '@/src/shared/hooks/use-update-profile-mutation';
import { nameSchema } from '@/src/shared/lib/profile-validation';

export function useOnboardingProfile() {
  const router = useRouter();
  const { accessToken, loading } = useAuth();
  const profileQuery = useProfileQuery(accessToken);
  const updateProfileMutation = useUpdateProfileMutation();
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const savedName = profileQuery.data?.profile.full_name.trim();

  useEffect(() => {
    if (savedName) router.replace('/dashboard');
  }, [router, savedName]);

  function handleNameChange(value: string) {
    setName(value);
    setErrorMessage('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    if (!accessToken) {
      setErrorMessage('Сессия не найдена. Войдите в аккаунт повторно.');
      return;
    }

    const parsedName = nameSchema.safeParse({ fullName: name });
    if (!parsedName.success) {
      setErrorMessage(parsedName.error.issues[0]?.message ?? 'Введите корректное имя.');
      return;
    }

    updateProfileMutation.mutate(
      { fullName: parsedName.data.fullName, accessToken },
      {
        onSuccess: () => router.replace('/dashboard'),
        onError: (error) => setErrorMessage(
          error instanceof Error ? error.message : 'Не удалось сохранить имя.'
        ),
      }
    );
  }

  return {
    errorMessage,
    handleNameChange,
    handleSubmit,
    isLoading: loading || profileQuery.isLoading,
    isSaving: updateProfileMutation.isPending,
    name,
  };
}
