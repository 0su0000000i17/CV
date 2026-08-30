'use client';

import { useQuery } from '@tanstack/react-query';
import { Radar } from 'lucide-react';

import { type AdminTrafficChannel, getAdminTrafficSources } from '@/src/shared/api/admin';
import { useAuth } from '@/src/shared/hooks/use-auth';

function formatNumber(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

function formatRub(value: number) {
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value)} ₽`;
}

export default function AdminTrafficSourcesPage() {
  const { accessToken } = useAuth();

  const channelsQuery = useQuery({
    queryKey: ['admin-traffic-sources'],
    queryFn: () => getAdminTrafficSources(accessToken as string),
    enabled: Boolean(accessToken),
    retry: false,
  });

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-border bg-background p-2 text-muted-foreground">
          <Radar className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-medium tracking-tight text-foreground">Источники трафика</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Регистрации и выручка по UTM-меткам первого захода (utm_source/utm_medium/utm_campaign).
            Метка сохраняется один раз при регистрации и не меняется при повторных заходах.
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        {channelsQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Загружаем источники...</p>
        ) : channelsQuery.isError ? (
          <p className="text-sm text-red-300">Не удалось загрузить источники трафика.</p>
        ) : channelsQuery.data.channels.length ? (
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-xs uppercase tracking-widest text-muted-foreground">
              <tr className="border-b border-border">
                <th className="pb-3 pr-4 font-medium">Канал</th>
                <th className="pb-3 pr-4 font-medium">Кампания</th>
                <th className="pb-3 pr-4 font-medium">Регистраций</th>
                <th className="pb-3 pr-4 font-medium">Платящих</th>
                <th className="pb-3 pr-4 font-medium">Выручка</th>
                <th className="pb-3 font-medium">Конверсия</th>
              </tr>
            </thead>
            <tbody>
              {channelsQuery.data.channels.map((channel: AdminTrafficChannel) => (
                <tr key={`${channel.source}-${channel.campaign ?? ''}`} className="border-b border-border/70">
                  <td className="py-3 pr-4 text-foreground">
                    <p className="font-medium">{channel.source}</p>
                    {channel.medium ? <p className="mt-1 text-xs text-muted-foreground">{channel.medium}</p> : null}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{channel.campaign ?? '—'}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{formatNumber(channel.registrations)}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{formatNumber(channel.payingUsers)}</td>
                  <td className="py-3 pr-4 text-foreground">{formatRub(channel.revenueRub)}</td>
                  <td className="py-3 text-muted-foreground">{channel.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-muted-foreground">Пока нет данных — метки появятся после первых регистраций по ссылкам с utm-параметрами.</p>
        )}
      </div>
    </section>
  );
}
