import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="w-full border-b border-neutral-800 bg-black">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 md:px-12">
        {/* Логотип */}
        <Link href="/" className="text-xl font-bold tracking-tighter">
          CV
        </Link>

        {/* Навигация */}
        <nav className="flex items-center gap-8 text-sm font-medium tracking-tight text-neutral-400">
          <Link href="/contacts" className="hover:text-white transition-colors uppercase text-xs tracking-widest">
            Контакты
          </Link>
          <Link href="/about" className="hover:text-white transition-colors uppercase text-xs tracking-widest">
            О нас
          </Link>
          
          {/* Кнопка Войти из UI библиотеки */}
          <Button variant="outline" className="border-neutral-800 text-white hover:bg-white hover:text-black transition-all text-xs uppercase tracking-widest px-5">
            Войти
          </Button>
        </nav>
      </div>
    </header>
  );
}