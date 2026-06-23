import Link from "next/link";
import { ProfilePopover } from "./profile-popover";

type Props = {
  isLoginPage: boolean;
  loading: boolean;
  authenticated: boolean;
  fullName: string;
  email: string;
  profileLoading: boolean;
};

export function DesktopAuthControl({
  isLoginPage,
  loading,
  authenticated,
  fullName,
  email,
  profileLoading,
}: Props) {
  if (isLoginPage) {
    return <div className="h-[38px] w-full" />;
  }

  if (loading) {
    return (
      <div className="ml-auto h-[38px] w-[76px] animate-pulse rounded-lg bg-muted" />
    );
  }

  if (!authenticated) {
    return (
      <Link
        href="/login"
        className="ml-auto inline-block rounded-lg bg-foreground px-4 py-2 text-center text-sm font-medium text-background transition-colors hover:bg-foreground/80"
      >
        Войти
      </Link>
    );
  }

  return (
    <div className="flex justify-end">
      <ProfilePopover
        fullName={fullName}
        email={email}
        loading={profileLoading}
      />
    </div>
  );
}