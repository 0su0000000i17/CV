import { Menu, X } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClick: () => void;
};

export function MobileMenuButton({ isOpen, onClick }: Props) {
  const Icon = isOpen ? X : Menu;

  return (
    <button
      type="button"
      onPointerUp={onClick}
      className="fixed right-4 top-2 z-[9999] inline-flex h-12 w-12 shrink-0 touch-manipulation items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors active:bg-muted md:hidden"
      aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
      aria-expanded={isOpen}
      aria-controls="mobile-navigation-menu"
    >
      <Icon className="pointer-events-none h-7 w-7" strokeWidth={1.8} />
    </button>
  );
}
