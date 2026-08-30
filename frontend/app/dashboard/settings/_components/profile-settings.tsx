'use client';

import { useProfileQuery } from '@/src/shared/hooks/use-profile-query';
import { useAuth } from '@/src/shared/hooks/use-auth';
import { BillingSettingsCard } from './billing-settings-card';
import { ProfileEmailForm } from './profile-email-form';
import { ProfileNameForm } from './profile-name-form';

export function ProfileSettings({ view = 'profile' }: {
  view?: 'profile' | 'billing';
}) {
  const { accessToken, loading } = useAuth();
  const query = useProfileQuery(accessToken);
  if (loading || query.isLoading) return null;
  if (!accessToken) return <section className="rounded-2xl border border-red-500/30 bg-card/60 p-5 text-sm text-red-500">Сессия не найдена. Войдите в аккаунт повторно.</section>;
  if (query.isError) {
    return <section className="rounded-2xl border border-red-500/30 bg-card/60 p-5">
      <p className="text-sm text-red-500">{query.error instanceof Error ? query.error.message : 'Не удалось загрузить профиль.'}</p>
      <button type="button" onClick={() => query.refetch()}
        className="mt-4 rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">Повторить</button>
    </section>;
  }
  const profile = query.data?.profile;
  if (!profile) return null;
  if (view === 'billing') return <BillingSettingsCard accessToken={accessToken} />;
  return (
    <section key={`${profile.id}:${profile.updated_at}`}
      className="rounded-2xl border border-white/10 bg-white/[0.018] p-5 sm:p-6">
      <div className="divide-y divide-white/[0.08]">
        <ProfileNameForm fullName={profile.full_name} accessToken={accessToken} />
        <ProfileEmailForm email={profile.email} />
      </div>
    </section>
  );
}
