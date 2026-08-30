import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import { getSafeInternalPath } from '@/src/shared/lib/safe-internal-path';

export async function proxy(request: NextRequest) {
  const isDevAuth =
    process.env.NODE_ENV !== 'production' &&
    process.env.NEXT_PUBLIC_DEV_AUTH === 'true';

  if (isDevAuth) {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/login';

  if (isDashboardRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    const target = new URL(
      getSafeInternalPath(request.nextUrl.searchParams.get('next')),
      request.url
    );
    url.pathname = target.pathname;
    url.search = target.search;
    url.hash = target.hash;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login'],
};
