'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useUpdateProfileMutation } from '@/src/shared/hooks/use-update-profile-mutation';
import { nameSchema, type NameFormValues } from '@/src/shared/lib/profile-validation';

export function ProfileNameForm(props: {
  fullName: string;
  accessToken: string;
}) {
  const [message, setMessage] = useState('');
  const mutation = useUpdateProfileMutation();
  const form = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema), mode: 'onChange',
    defaultValues: { fullName: props.fullName },
  });
  function submit(values: NameFormValues) {
    setMessage('');
    mutation.mutate({ fullName: values.fullName, accessToken: props.accessToken }, {
      onSuccess: () => {
        setMessage('Имя изменено.');
        form.reset({ fullName: values.fullName });
      },
      onError: (error) => form.setError('fullName', {
        message: error instanceof Error ? error.message : 'Не удалось изменить имя.',
      }),
    });
  }
  return (
    <form onSubmit={form.handleSubmit(submit)}
      className="grid gap-3 pb-5 lg:grid-cols-[180px_minmax(0,1fr)_128px] lg:items-start">
      <div><label htmlFor="full-name" className="text-sm font-medium text-foreground">Имя</label>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Отображается в личном кабинете.</p></div>
      <div>
        <input id="full-name" type="text" maxLength={100} autoComplete="name"
          className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 text-sm text-foreground outline-none transition-[background-color,border-color] focus:border-white/25 focus:bg-white/[0.035]"
          {...form.register('fullName', { onChange: () => setMessage('') })} />
        <p className="mt-2 min-h-4 text-xs" aria-live="polite">
          {form.formState.errors.fullName ? <span className="text-red-500">{form.formState.errors.fullName.message}</span>
            : message ? <span className="text-emerald-500">{message}</span> : null}
        </p>
      </div>
      <button type="submit" disabled={!form.formState.isDirty || !form.formState.isValid || mutation.isPending}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2563a9] px-4 text-sm font-medium text-white transition-[background-color,box-shadow] hover:bg-[#2b6fba] hover:shadow-[0_8px_24px_rgba(24,88,155,0.18)] disabled:cursor-not-allowed disabled:opacity-40">
        {mutation.isPending ? 'Сохраняем...' : 'Сохранить'}
      </button>
    </form>
  );
}
