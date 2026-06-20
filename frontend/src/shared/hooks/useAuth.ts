'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/src/shared/lib/supabase/client';

const DEV_AUTH = process.env.NEXT_PUBLIC_DEV_AUTH === "true";

const devUser = {
  id: "dev-user",
  email: "dev@cvprophet.local",
};

export function useAuth() {
  const [user, setUser] = useState<any>(DEV_AUTH ? devUser : null);
  const [loading, setLoading] = useState(!DEV_AUTH);

  useEffect(() => {
    if (DEV_AUTH) return;

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
  };
}
