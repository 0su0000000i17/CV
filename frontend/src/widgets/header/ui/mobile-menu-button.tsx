import { Menu, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClick: () => void;
};

export function MobileMenuButton({ isOpen, onClick }: Props) {
  const Icon = isOpen ? X : Menu;

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative z-[70] inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted md:hidden"
      aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
      aria-expanded={isOpen}
      aria-controls="mobile-navigation-menu"
    >
      <Icon className="h-7 w-7" strokeWidth={1.8} />
    </button>
  );
}
