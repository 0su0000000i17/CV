'use client';

import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { supabase } from '@/src/shared/lib/supabase/client';

const DEV_AUTH = process.env.NEXT_PUBLIC_DEV_AUTH === 'true';

type AuthUser = Pick<User, 'id' | 'email'>;

const devUser: AuthUser = {
  id: 'dev-user',
  email: 'dev@cvprophet.local',
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(DEV_AUTH ? devUser : null);
  const [accessToken, setAccessToken] = useState<string>();
  const [loading, setLoading] = useState(!DEV_AUTH);

  useEffect(() => {
    if (DEV_AUTH) return;

    let active = true;

    Promise.all([supabase.auth.getUser(), supabase.auth.getSession()]).then(
      ([userResult, sessionResult]) => {
        if (!active) return;

        setUser(userResult.data.user ?? null);
        setAccessToken(sessionResult.data.session?.access_token);
        setLoading(false);
      }
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    accessToken,
    loading,
  };
}
