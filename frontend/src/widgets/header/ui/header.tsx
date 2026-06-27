"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import { Logo } from "@/src/shared/ui/logo";
import { useAuth } from "@/src/shared/hooks/use-auth";
import { useProfileQuery } from "@/src/shared/hooks/use-profile-query";
import { ThemeToggleButton } from "./theme-toggle-button";
import { HeaderNavLinks } from "./header-nav-links";
import { DesktopAuthControl } from "./desktop-auth-control";
import { MobileMenuButton } from "./mobile-menu-button";
import { MobileMenu } from "./mobile-menu";
export function Header() {
  const { user, accessToken, loading } = useAuth();
  const profileQuery = useProfileQuery(accessToken);
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [debugTapCount, setDebugTapCount] = useState(0);

  useEffect(() => {
    setMounted(true);

    window.alert("CVPro debug: Header client JS mounted");
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isLoginPage = pathname === "/login";
  const isDashboard = pathname.startsWith("/dashboard");
  const authenticated = Boolean(user);

  const profile = profileQuery.data?.profile;
  const email = profile?.email || user?.email || "";
  const fullName = profile?.full_name || email.split("@")[0] || "Пользователь";

  function handleToggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  function handleToggleMenu() {
    const nextTapCount = debugTapCount + 1;

    window.alert(
      `CVPro debug: burger tap ${nextTapCount}; menu was ${
        isMenuOpen ? "open" : "closed"
      }; path ${pathname}`
    );

    setDebugTapCount(nextTapCount);
    setIsMenuOpen((currentValue) => !currentValue);
  }

  function handleNavigate() {
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 md:px-6">
        <Link href="/" className="inline-flex items-center" aria-label="CVPro">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <HeaderNavLinks
            isDashboard={isDashboard}
            showDashboard={!loading && authenticated}
          />
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-medium text-red-300 md:hidden">
            dbg {debugTapCount}
          </span>

          <ThemeToggleButton
            mounted={mounted}
            resolvedTheme={resolvedTheme}
            onToggle={handleToggleTheme}
          />

          <div className="hidden min-w-[76px] md:block">
            <DesktopAuthControl
              isLoginPage={isLoginPage}
              loading={loading}
              authenticated={authenticated}
              fullName={fullName}
              email={email}
              profileLoading={profileQuery.isLoading}
            />
          </div>

          <MobileMenuButton isOpen={isMenuOpen} onClick={handleToggleMenu} />
        </div>
      </div>

      <MobileMenu
        isOpen={isMenuOpen}
        isDashboard={isDashboard}
        showDashboard={!loading && authenticated}
        isLoginPage={isLoginPage}
        loading={loading}
        authenticated={authenticated}
        fullName={fullName}
        email={email}
        onNavigate={handleNavigate}
      />
    </header>
  );
}
