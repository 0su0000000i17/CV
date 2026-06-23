import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import { supabase } from "@/src/shared/lib/supabase/client";
import { DashboardMobileMenu } from "./dashboard-mobile-menu";
import { HeaderNavLinks } from "./header-nav-links";

type Props = {
  isOpen: boolean;
  isDashboard: boolean;
  showDashboard: boolean;
  isLoginPage: boolean;
  loading: boolean;
  authenticated: boolean;
  fullName: string;
  email: string;
  onNavigate: () => void;
};

export function MobileMenu({
  isOpen,
  isDashboard,
  showDashboard,
  isLoginPage,
  loading,
  authenticated,
  fullName,
  email,
  onNavigate,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    onNavigate();

    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      console.error(error);
      return;
    }

    queryClient.clear();
    router.replace("/");
    router.refresh();
  }

  return (
    <div
      id="mobile-navigation-menu"
      aria-hidden={!isOpen}
      className={`fixed inset-x-0 top-16 z-[60] max-h-[calc(100vh-64px)] overflow-y-auto bg-background/95 px-6 py-6 backdrop-blur transition-all duration-300 md:hidden ${
        isOpen
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-4 opacity-0"
      }`}
    >
      {isDashboard ? (
        <div className="mx-auto max-w-sm">
          <DashboardMobileMenu onNavigate={onNavigate} />
        </div>
      ) : (
        <nav className="mx-auto flex max-w-sm flex-col gap-4 text-sm font-medium">
          <HeaderNavLinks
            isDashboard={isDashboard}
            showDashboard={showDashboard}
            onNavigate={onNavigate}
          />

          {!isLoginPage && !loading ? (
            authenticated ? (
              <div className="mt-2 rounded-2xl border border-border bg-card/80 p-4">
                <p className="truncate font-medium text-foreground">
                  {fullName}
                </p>

                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {email}
                </p>

                <Link
                  href="/dashboard/settings"
                  onClick={onNavigate}
                  className="mt-4 block rounded-xl border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Настройки профиля
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Выйти
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={onNavigate}
                className="mt-2 w-full rounded-lg bg-foreground px-4 py-2 text-center text-sm font-medium text-background"
              >
                Войти
              </Link>
            )
          ) : null}
        </nav>
      )}
    </div>
  );
}