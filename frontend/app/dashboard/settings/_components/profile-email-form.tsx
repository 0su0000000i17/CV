'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { supabase } from '@/src/shared/lib/supabase/client';
import { emailSchema, type EmailFormInput, type EmailFormValues } from '@/src/shared/lib/profile-validation';

export function ProfileEmailForm({ email }: { email: string }) {
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const form = useForm<EmailFormInput, unknown, EmailFormValues>({
    resolver: zodResolver(emailSchema), mode: 'onChange', defaultValues: { email },
  });
  async function submit(values: EmailFormValues) {
    setMessage(''); setSubmitError('');
    const { error } = await supabase.auth.updateUser({ email: values.email }, {
      emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
    });
    if (error) { setSubmitError(error.message); return; }
    form.reset({ email: values.email });
    setMessage('Письмо отправлено. Подтвердите новый email по ссылке из письма.');
  }
  return (
    <form onSubmit={form.handleSubmit(submit)}
      className="grid gap-3 py-5 lg:grid-cols-[180px_minmax(0,1fr)_128px] lg:items-start">
      <div><div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" />
        <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label></div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Новый адрес нужно подтвердить.</p></div>
      <div>
        <input id="email" type="email" autoComplete="email"
          className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 text-sm text-foreground outline-none transition-[background-color,border-color] focus:border-white/25 focus:bg-white/[0.035]"
          {...form.register('email', { onChange: () => { setMessage(''); setSubmitError(''); } })} />
        <p className="mt-2 min-h-4 text-xs" aria-live="polite">
          {form.formState.errors.email ? <span className="text-red-500">{form.formState.errors.email.message}</span>
            : submitError ? <span className="text-red-500">{submitError}</span>
              : message ? <span className="text-emerald-500">{message}</span> : null}
        </p>
      </div>
      <button type="submit" disabled={!form.formState.isDirty || !form.formState.isValid || form.formState.isSubmitting}
        className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-4 text-sm font-medium text-foreground transition-[background-color,border-color] hover:border-white/20 hover:bg-white/[0.035] disabled:cursor-not-allowed disabled:opacity-40">
        {form.formState.isSubmitting ? 'Отправляем...' : 'Изменить'}
      </button>
    </form>
  );
}
