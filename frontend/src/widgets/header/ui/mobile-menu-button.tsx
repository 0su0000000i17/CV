import { Menu, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClick: () => void;
  isDashboard: boolean;
};

export function MobileMenuButton({ isOpen, onClick, isDashboard }: Props) {
  const Icon = isOpen ? X : Menu;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative z-[70] inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground transition-[background-color,transform] duration-200 ease-out hover:bg-white/[0.06] active:scale-[0.94] ${
        isDashboard ? "lg:hidden" : "md:hidden"
      }`}
      aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
      aria-expanded={isOpen}
      aria-controls="mobile-navigation-menu"
    >
      <Icon className="h-5 w-5" strokeWidth={1.8} />
    </button>
  );
}
