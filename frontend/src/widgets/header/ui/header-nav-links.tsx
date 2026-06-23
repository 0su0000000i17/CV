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

      <Link
        href="/contacts"
        onClick={onNavigate}
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        Контакты
      </Link>

      {showDashboard ? (
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={`transition-colors ${
            isDashboard
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Личный кабинет
        </Link>
      ) : null}
    </>
  );
}