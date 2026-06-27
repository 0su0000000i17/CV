import { useRef } from "react";
import { Menu, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClick: () => void;
};

export function MobileMenuButton({ isOpen, onClick }: Props) {
  const Icon = isOpen ? X : Menu;
  const lastTouchTimeRef = useRef(0);

  function handleTouchEnd(event: React.TouchEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    lastTouchTimeRef.current = Date.now();
    onClick();
  }

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (Date.now() - lastTouchTimeRef.current < 500) {
      return;
    }

    onClick();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      className="relative z-[120] inline-flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:bg-muted md:hidden"
      aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
      aria-expanded={isOpen}
      aria-controls="mobile-navigation-menu"
    >
      <Icon className="pointer-events-none h-7 w-7" strokeWidth={1.8} />
    </button>
  );
}
