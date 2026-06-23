import { Moon, Sun } from "lucide-react";

type Props = {
  mounted: boolean;
  resolvedTheme?: string;
  onToggle: () => void;
};

export function ThemeToggleButton({
  mounted,
  resolvedTheme,
  onToggle,
}: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-full p-2 transition-colors hover:bg-muted"
      aria-label="Переключить тему"
    >
      {mounted ? (
        resolvedTheme === "dark" ? (
          <Sun className="h-5 w-5 text-foreground" />
        ) : (
          <Moon className="h-5 w-5 text-foreground" />
        )
      ) : (
        <div className="h-5 w-5" />
      )}
    </button>
  );
}