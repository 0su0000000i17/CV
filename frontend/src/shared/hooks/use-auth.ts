'use client';

import type { User } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { supabase } from '@/src/shared/lib/supabase/client';

const DEV_AUTH =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_DEV_AUTH === 'true';

type AuthUser = Pick<User, 'id' | 'email'>;

const devUser: AuthUser = {
  id: 'dev-user',
  email: 'dev@cvmatch.local',
};

type AuthSession = {
  user: AuthUser | null;
  accessToken: string | undefined;
};

const AUTH_QUERY_KEY = ['auth-session'];

async function fetchAuthSession(): Promise<AuthSession> {
  const [userResult, sessionResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);

  return {
    user: userResult.data.user ?? null,
    accessToken: sessionResult.data.session?.access_token,
  };
}

// Every component that needs auth state calls this hook, and several are
// mounted at once on any given page (header, dashboard layout, ...). Backing
// it with React Query - instead of each instance running its own
// getUser()/getSession() effect - lets concurrent mounts share a single
// in-flight request and cache entry rather than each firing its own
// duplicate network round trip on every navigation.
export function useAuth() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchAuthSession,
    enabled: !DEV_AUTH,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (DEV_AUTH) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData<AuthSession>(AUTH_QUERY_KEY, {
        user: session?.user ?? null,
        accessToken: session?.access_token,
      });
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  if (DEV_AUTH) {
    return { user: devUser, accessToken: undefined, loading: false };
  }

  return {
    user: query.data?.user ?? null,
    accessToken: query.data?.accessToken,
    loading: query.isLoading,
  };
}
