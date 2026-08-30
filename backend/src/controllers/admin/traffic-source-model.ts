export type AttributionProfileRow = {
  id: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
};

export type PaymentRow = {
  user_id: string;
  amount_rub: number | string;
  status: string;
};

type ChannelStats = {
  source: string;
  medium: string | null;
  campaign: string | null;
  registrations: number;
  payingUsers: number;
  revenueRub: number;
};

export function createTrafficChannels(
  profiles: AttributionProfileRow[],
  payments: PaymentRow[]
) {
  const revenueByUser = new Map<string, number>();
  for (const payment of payments) {
    if (payment.status !== "succeeded") continue;
    revenueByUser.set(
      payment.user_id,
      (revenueByUser.get(payment.user_id) ?? 0) + Number(payment.amount_rub)
    );
  }

  const statsByChannel = new Map<string, ChannelStats>();
  for (const profile of profiles) {
    const source = profile.utm_source?.trim() || "(прямой заход)";
    const medium = profile.utm_medium?.trim() || null;
    const campaign = profile.utm_campaign?.trim() || null;
    const key = `${source}\u0000${campaign ?? ""}`;
    const stats = statsByChannel.get(key) ?? {
      source,
      medium,
      campaign,
      registrations: 0,
      payingUsers: 0,
      revenueRub: 0,
    };
    stats.registrations += 1;
    const revenue = revenueByUser.get(profile.id) ?? 0;
    if (revenue > 0) {
      stats.payingUsers += 1;
      stats.revenueRub += revenue;
    }
    statsByChannel.set(key, stats);
  }

  return Array.from(statsByChannel.values())
    .map((stats) => ({
      ...stats,
      revenueRub: Math.round(stats.revenueRub * 100) / 100,
      conversionRate: stats.registrations
        ? Math.round((stats.payingUsers / stats.registrations) * 1_000) / 10
        : 0,
    }))
    .sort((a, b) => b.revenueRub - a.revenueRub || b.registrations - a.registrations);
}
