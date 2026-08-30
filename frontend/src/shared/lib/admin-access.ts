import 'server-only';

import { cache } from 'react';

import { getApiUrl } from '@/src/shared/api/http';
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server';

export type AdminPageAccess =
  | { status: 'admin' }
  | { status: 'unauthenticated' }
  | { status: 'forbidden' };

export const getAdminPageAccess = cache(async (): Promise<AdminPageAccess> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: 'unauthenticated' };

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token || session.user.id !== user.id) {
    return { status: 'unauthenticated' };
  }

  const response = await fetch(`${getApiUrl()}/api/admin/me`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    cache: 'no-store',
  });

  if (response.ok) return { status: 'admin' };
  if (response.status === 401) return { status: 'unauthenticated' };
  if (response.status === 403 || response.status === 404) {
    return { status: 'forbidden' };
  }

  throw new Error(`Admin access check failed with status ${response.status}`);
});
