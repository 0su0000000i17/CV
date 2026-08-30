import type { NextConfig } from 'next';

function getOrigin(value: string | undefined) {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getWebSocketOrigin(value: string | undefined) {
  const origin = getOrigin(value);
  if (!origin) return null;

  return origin.replace(/^http/u, 'ws');
}

const isDevelopment = process.env.NODE_ENV !== 'production';
const apiOrigin = getOrigin(process.env.NEXT_PUBLIC_API_URL);
const supabaseOrigin = getOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseWebSocketOrigin = getWebSocketOrigin(
  process.env.NEXT_PUBLIC_SUPABASE_URL
);
const connectSources = [
  "'self'",
  apiOrigin,
  supabaseOrigin,
  supabaseWebSocketOrigin,
  'https://mc.yandex.ru',
  'https://mc.yandex.com',
  isDevelopment ? 'ws:' : null,
].filter(Boolean);
const scriptSources = [
  "'self'",
  "'unsafe-inline'",
  isDevelopment ? "'unsafe-eval'" : null,
  'https://mc.yandex.ru',
].filter(Boolean);

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSources.join(' ')}`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://mc.yandex.ru https://mc.yandex.com",
  "font-src 'self' data:",
  `connect-src ${connectSources.join(' ')}`,
  "worker-src 'self' blob:",
  "frame-src 'self' https://mc.yandex.ru https://mc.yandex.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  isDevelopment ? null : 'upgrade-insecure-requests',
]
  .filter(Boolean)
  .join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  ...(isDevelopment
    ? []
    : [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
      ]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
