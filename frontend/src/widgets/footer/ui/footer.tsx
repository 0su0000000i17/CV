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
            <p>© 2026 CVPro. Все права защищены.</p>
            <a
              href="mailto:support@cvpro.ru"
              className="transition-colors hover:text-foreground"
            >
              support@cvpro.ru
            </a>
          </div>

          <nav className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-8">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Условия использования
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
