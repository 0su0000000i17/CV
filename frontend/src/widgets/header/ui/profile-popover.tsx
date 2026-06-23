import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CircleUserRound, LogOut } from "lucide-react";

import { supabase } from "@/src/shared/lib/supabase/client";

type Props = {
  fullName: string;
  email: string;
  loading: boolean;
};

export function ProfilePopover({ fullName, email, loading }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  async function handleSignOut() {
    setIsOpen(false);

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
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-muted-foreground"
        aria-label="Открыть профиль"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <CircleUserRound className="h-7 w-7" strokeWidth={1.7} />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-[70] mt-2 w-60 rounded-2xl border border-border bg-background p-4 shadow-2xl"
        >
          {loading ? (
            <div className="space-y-3">
              <div className="h-5 w-28 animate-pulse rounded bg-muted" />
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <>
              <p className="truncate font-medium text-foreground">{fullName}</p>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {email}
              </p>
            </>
          )}

          <div className="mt-4 flex items-center justify-between rounded-xl bg-muted px-3 py-2.5">
            <span className="text-xs text-muted-foreground">Текущий тариф</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
              Free
            </span>
          </div>

          <Link
            href="/dashboard/settings"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="mt-3 block rounded-xl border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Настройки профиля
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      ) : null}
    </div>
  );
}