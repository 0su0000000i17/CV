'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const hiddenFooterPrefixes = ['/dashboard', '/admin'];

export function Footer() {
  const pathname = usePathname();

  if (hiddenFooterPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <footer className="mx-auto w-full max-w-[1400px] px-6 md:px-12">
      <div className="border-t border-border pb-8 pt-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="text-sm leading-6 text-muted-foreground">
            <p>© 2026 cvmatch.ru. Все права защищены.</p>
            <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
              <a
                href="mailto:support@cvmatch.ru"
                className="transition-colors hover:text-foreground"
              >
                support@cvmatch.ru
              </a>
            </div>
          </div>

          <nav className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-8">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Условия использования
            </Link>
            <Link href="/offer" className="transition-colors hover:text-foreground">
              Оферта
            </Link>
            <Link href="/personal-data" className="transition-colors hover:text-foreground">
              Согласие на обработку ПДн
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
