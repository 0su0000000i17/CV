'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/src/shared/lib/supabase/client';
import { getStoredUtmAttribution } from '@/src/shared/lib/utm-attribution';
import { getSafeInternalPath } from '@/src/shared/lib/safe-internal-path';

const schema = z.object({
  email: z.string().trim().min(1, 'Введите email.').email('Введите корректный email.')
    .transform((value) => value.toLowerCase()),
  legalAccepted: z.boolean().refine(Boolean, 'Чтобы продолжить, примите условия сервиса.'),
  pdnAccepted: z.boolean().refine(Boolean, 'Нужно согласие на обработку персональных данных.'),
});
type Input = z.input<typeof schema>;
type Values = z.output<typeof schema>;
type Screen = 'form' | 'success';

export function useLoginFlow() {
  const [nextPath] = useState(() => typeof window === 'undefined' ? '/dashboard'
    : getSafeInternalPath(new URLSearchParams(window.location.search).get('next')));
  const [screen, setScreen] = useState<Screen>('form');
  const [motion, setMotion] = useState<'entering' | 'idle' | 'leaving'>('entering');
  const [pendingScreen, setPendingScreen] = useState<Screen>('form');
  const [message, setMessage] = useState('');
  const [sentTo, setSentTo] = useState('');
  const form = useForm<Input, unknown, Values>({
    resolver: zodResolver(schema), mode: 'onChange',
    defaultValues: { email: '', legalAccepted: false, pdnAccepted: false },
  });
  useEffect(() => {
    if (motion === 'idle') return;
    const timer = window.setTimeout(() => {
      if (motion === 'leaving') { setScreen(pendingScreen); setMotion('entering'); }
      else setMotion('idle');
    }, motion === 'leaving' ? 220 : 720);
    return () => window.clearTimeout(timer);
  }, [motion, pendingScreen]);
  const transition = (next: Screen) => { setPendingScreen(next); setMotion('leaving'); };
  async function submit(values: Values) {
    setMessage('');
    const callback = new URL('/auth/callback', window.location.origin);
    callback.searchParams.set('next', nextPath);
    const utm = getStoredUtmAttribution();
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: { emailRedirectTo: callback.toString(), data: utm ? {
        utm_source: utm.utmSource, utm_medium: utm.utmMedium,
        utm_campaign: utm.utmCampaign,
      } : undefined },
    });
    if (error) { setMessage(error.message); return; }
    setSentTo(values.email); transition('success');
  }
  return { screen, motion, message, sentTo, form, submit,
    showForm: () => transition('form') };
}

export type LoginFlow = ReturnType<typeof useLoginFlow>;
