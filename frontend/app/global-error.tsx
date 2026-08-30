'use client';

import { useEffect } from 'react';

// Only catches errors thrown by the root layout itself (very rare - regular
// page/segment errors are caught by error.tsx instead, which keeps the
// normal header/footer chrome). This one must render its own <html>/<body>
// since it replaces the root layout entirely, so it can't lean on the
// app's theme provider or Tailwind tokens - kept intentionally minimal.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111111',
          color: '#f2f2f2',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ maxWidth: 420, padding: 24 }}>
          <p style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 500 }}>
            Сервис сейчас недоступен
          </p>
          <p style={{ margin: '0 0 24px', color: '#a3a3a3', lineHeight: 1.5 }}>
            Произошла непредвиденная ошибка. Попробуйте обновить страницу
            через минуту.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: '#f2f2f2',
              color: '#111111',
              border: 'none',
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Попробовать снова
          </button>
        </div>
      </body>
    </html>
  );
}
