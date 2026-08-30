'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<string | { value: string; label: string }>;
  placeholder?: string;
};

export function SelectInput({ label, value, onChange, options, placeholder = 'Не указано' }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const normalized = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option
  );
  const selected = normalized.find((option) => option.value === value);
  const visibleOptions = selected || !value ? normalized : [{ value, label: value }, ...normalized];

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  function choose(nextValue: string) {
    onChange(nextValue);
    setIsOpen(false);
  }

  return (
    <div ref={rootRef} className="relative block">
      <span className="pointer-events-none absolute left-3 top-1 z-10 text-[11px] leading-none text-muted-foreground">
        {label}
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className={`flex h-10 w-full cursor-pointer items-end justify-between rounded-lg border bg-background/70 px-3 pb-1.5 pt-4 text-left text-sm text-foreground outline-none transition-colors ${
          isOpen ? 'border-foreground/50 ring-2 ring-foreground/5' : 'border-border hover:border-foreground/30'
        }`}
      >
        <span className="truncate">{selected?.label || value || placeholder}</span>
        <ChevronDown className={`mb-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen ? (
        <div role="listbox" className="absolute left-0 right-0 top-[calc(100%+6px)] z-[80] max-h-64 overflow-y-auto rounded-xl border border-border bg-background/95 p-1 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <SelectOption label={placeholder} selected={!value} onSelect={() => choose('')} />
          {visibleOptions.map((option) => (
            <SelectOption
              key={option.value}
              label={option.label}
              selected={option.value === value}
              onSelect={() => choose(option.value)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SelectOption({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
        selected ? 'bg-brand-500/15 text-brand-300' : 'text-foreground hover:bg-muted'
      }`}
    >
      <span>{label}</span>
      {selected ? <Check className="h-4 w-4" /> : null}
    </button>
  );
}
