'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAdminPromoCode, createTargetedAdminPromoCode, deleteAdminPromoCode, getAdminPromoCodes, updateAdminPromoCode, type AdminPromoCode } from '@/src/shared/api/admin';
import { defaultPromoForm, normalizeDiscount, normalizePromoCode, toIsoDateTime, type PromoFormState } from './admin-promo-model';

export function useAdminPromoCodes(accessToken: string) {
  const client = useQueryClient();
  const [form, setForm] = useState(defaultPromoForm);
  const [message, setMessage] = useState('');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const confirmTimer = useRef<number | null>(null);
  const query = useQuery({ queryKey: ['admin-promo-codes'],
    queryFn: () => getAdminPromoCodes(accessToken), enabled: Boolean(accessToken) });
  const invalidate = () => void client.invalidateQueries({ queryKey: ['admin-promo-codes'] });
  const createMutation = useMutation({
    mutationFn: () => {
      const targetEmail = form.targetEmail.trim().toLowerCase();
      if (form.personal && !targetEmail) throw new Error('Укажите email для личного промокода');
      const payload = {
        code: normalizePromoCode(form.code), description: form.description.trim() || undefined,
        discountType: form.discountType,
        discountValue: Number(normalizeDiscount(form.discountValue, form.discountType)),
        maxRedemptions: form.personal ? 1 : form.maxRedemptions ? Number(form.maxRedemptions) : null,
        perUserLimit: 1, startsAt: toIsoDateTime(form.startsAt),
        expiresAt: toIsoDateTime(form.expiresAt), isActive: true,
      };
      return form.personal
        ? createTargetedAdminPromoCode({ ...payload, targetEmail }, accessToken)
        : createAdminPromoCode(payload, accessToken);
    },
    onSuccess: () => { setForm(defaultPromoForm); setMessage('Промокод создан'); invalidate(); },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'Не удалось создать промокод'),
  });
  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateAdminPromoCode(id, { isActive: active }, accessToken), onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminPromoCode(id, accessToken), onSuccess: invalidate,
  });
  const update = <Key extends keyof PromoFormState>(key: Key, value: PromoFormState[Key]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const deletePromo = (promo: AdminPromoCode) => {
    if (confirmingDeleteId === promo.id) {
      setConfirmingDeleteId(null); deleteMutation.mutate(promo.id); return;
    }
    if (confirmTimer.current !== null) window.clearTimeout(confirmTimer.current);
    setConfirmingDeleteId(promo.id);
    confirmTimer.current = window.setTimeout(() => setConfirmingDeleteId(null), 3000);
  };
  useEffect(() => () => {
    if (confirmTimer.current !== null) window.clearTimeout(confirmTimer.current);
  }, []);
  return { form, update, setForm, message, setMessage, query, createMutation,
    toggleMutation, deleteMutation, confirmingDeleteId, deletePromo };
}

export type AdminPromoState = ReturnType<typeof useAdminPromoCodes>;
