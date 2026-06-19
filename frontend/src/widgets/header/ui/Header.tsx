"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/src/shared/lib/supabase/client";
import { useAuth } from "@/src/shared/hooks/useAuth";

export function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const isLoginPage = pathname === "/login";
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <header className="w-full border-b border-neutral-800 bg-black">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 md:px-12">
        <Link href="/" className="text-xl font-bold tracking-tighter text-white">
          CV
        </Link>

        <nav className="flex items-center gap-8 text-sm font-medium tracking-tight text-neutral-400">
          <Link
            href="/contacts"
            className="hover:text-white transition-colors uppercase text-xs tracking-widest"
          >
            Контакты
          </Link>

          <Link
            href="/about"
            className="hover:text-white transition-colors uppercase text-xs tracking-widest"
          >
            О нас
          </Link>

          {!loading && user && (
            <Link
              href="/dashboard"
              className={`transition-colors uppercase text-xs tracking-widest ${
                isDashboard ? "text-white" : "hover:text-white"
              }`}
            >
              Личный кабинет
            </Link>
          )}

          {!loading && !user && !isLoginPage && (
            <Link
              href="/login"
              className="border border-neutral-800 px-5 py-2 text-xs uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all"
            >
              Войти
            </Link>
          )}

          {!loading && user && (
            <button
              type="button"
              onClick={handleLogout}
              className="border border-neutral-800 px-5 py-2 text-xs uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all"
            >
              Выйти
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}