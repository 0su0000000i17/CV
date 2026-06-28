import Link from "next/link";

type Props = {
  isDashboard: boolean;
  showDashboard: boolean;
  onNavigate?: () => void;
};

export function HeaderNavLinks({
  isDashboard,
  showDashboard,
  onNavigate,
}: Props) {
  if (isDashboard) {
    return null;
  }

  return (
    <>
      <Link
        href="/about"
        onClick={onNavigate}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        О проекте
      </Link>

      <Link
        href="/how-it-works"
        onClick={onNavigate}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        Как это работает
      </Link>

      {showDashboard ? (
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Личный кабинет
        </Link>
      ) : null}
    </>
  );
}
