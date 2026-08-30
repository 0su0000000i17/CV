'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelAdminPayment, confirmAdminPayment, getAdminPayments, getAdminTokenUsers, grantAdminTokens } from '@/src/shared/api/admin';
import { formatAdminNumber } from './admin-token-utils';

export function useAdminTokens(accessToken: string) {
  const client = useQueryClient();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [grantUserId, setGrantUserId] = useState<string | null>(null);
  const [amount, setAmount] = useState('100');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const usersQuery = useQuery({ queryKey: ['admin-token-users', query],
    queryFn: () => getAdminTokenUsers(query, accessToken) });
  const paymentsQuery = useQuery({ queryKey: ['admin-payments'],
    queryFn: () => getAdminPayments(accessToken) });
  const invalidate = () => {
    void client.invalidateQueries({ queryKey: ['admin-token-users'] });
    void client.invalidateQueries({ queryKey: ['admin-payments'] });
  };
  const grantMutation = useMutation({
    mutationFn: (payload: { userId: string; amount: number; note?: string }) =>
      grantAdminTokens(payload, accessToken),
    onSuccess: (data) => {
      setMessage(`Начислено. Новый баланс: ${formatAdminNumber(data.balance)} кредитов`);
      setGrantUserId(null); setNote(''); invalidate();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'Не удалось начислить кредиты'),
  });
  const confirmMutation = useMutation({
    mutationFn: (id: string) => confirmAdminPayment(id, accessToken),
    onSuccess: (data) => {
      setMessage(`Платёж подтверждён. Баланс пользователя: ${formatAdminNumber(data.balance)} кредитов`);
      invalidate();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'Не удалось подтвердить платёж'),
  });
  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelAdminPayment(id, accessToken),
    onSuccess: () => { setMessage('Платёж отменён'); invalidate(); },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'Не удалось отменить платёж'),
  });
  const grant = (userId: string) => {
    const number = Number(amount);
    if (!Number.isInteger(number) || number < 1) {
      setMessage('Сумма начисления должна быть целым положительным числом'); return;
    }
    grantMutation.mutate({ userId, amount: number, note: note.trim() || undefined });
  };
  const payments = paymentsQuery.data?.payments ?? [];
  return {
    search, setSearch, submitSearch: () => setQuery(search.trim()),
    usersQuery, pending: payments.filter((item) => item.status === 'pending'),
    processed: payments.filter((item) => item.status !== 'pending').slice(0, 10),
    grantUserId, setGrantUserId, amount, setAmount, note, setNote, message,
    grantMutation, confirmMutation, cancelMutation, grant,
  };
}

export type AdminTokensState = ReturnType<typeof useAdminTokens>;
