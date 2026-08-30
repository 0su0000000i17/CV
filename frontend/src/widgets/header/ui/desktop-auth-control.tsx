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
  if (isLoginPage || loading) {
    return <div aria-hidden className="h-10 w-20" />;
  }

  if (!authenticated) {
    return (
      <Link
        href="/login"
        className="flex h-9 w-20 items-center justify-center rounded-xl bg-brand-500 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-[background-color,box-shadow,transform] duration-200 ease-out hover:bg-brand-600 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.28)] active:scale-[0.97]"
      >
        Войти
      </Link>
    );
  }

  return (
    <div className="flex h-10 w-20 justify-end">
      <ProfilePopover
        fullName={fullName}
        email={email}
        loading={profileLoading}
      />
    </div>
  );
}
