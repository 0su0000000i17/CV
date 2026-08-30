'use client';

import { Loader2 } from 'lucide-react';

import { AdminTokensSection } from '../_components/admin-tokens-section';
import { useAuth } from '@/src/shared/hooks/use-auth';

export default function AdminTokensPage() {
  const { accessToken } = useAuth();

  if (!accessToken) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-5 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Загружаем...
      </div>
    );
  }

  return <AdminTokensSection accessToken={accessToken} />;
}
