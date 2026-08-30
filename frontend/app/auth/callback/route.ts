import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server';
import { getSafeInternalPath } from '@/src/shared/lib/safe-internal-path';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const requestedPath = requestUrl.searchParams.get('next');
  const redirectPath = getSafeInternalPath(requestedPath);

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL('/login?authError=1', request.url));
    }
  }

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
