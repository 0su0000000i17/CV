'use client';

import { ChevronsUpDown, Loader2 } from 'lucide-react';
import { useId, useRef, type ReactNode } from 'react';

import { ProjectAutocompletePanel } from './project-autocomplete-panel';
import { useProjectAutocomplete } from './use-project-autocomplete';
export type { ProjectAutocompleteOption } from './project-autocomplete-types';
import type { ProjectAutocompleteOption } from './project-autocomplete-types';

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  onSelect?: (option: ProjectAutocompleteOption) => void;
  options: ProjectAutocompleteOption[];
  ariaLabel: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  icon?: ReactNode;
  minChars?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  required?: boolean;
};

export function ProjectAutocomplete({
  value, onValueChange, onSelect, options, ariaLabel, placeholder,
  className = '', inputClassName = '', icon, minChars = 2,
  isLoading = false, emptyMessage = 'Подходящих вариантов не найдено', required = false,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const state = useProjectAutocomplete({ minChars, onSelect, onValueChange, options, value });
  const activeOption = options[state.activeIndex];
  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget)) state.setIsOpen(false);
      }}
    >
      {icon ? <span className="shrink-0 text-foreground/40">{icon}</span> : null}
      <input
        role="combobox"
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={state.showPanel}
        aria-activedescendant={state.showPanel && activeOption ? `${listboxId}-${activeOption.id}` : undefined}
        autoComplete="off"
        required={required}
        value={value}
        placeholder={placeholder}
        onFocus={() => state.setIsOpen(state.canShow)}
        onChange={(event) => state.handleChange(event.target.value)}
        onKeyDown={state.handleKeyDown}
        className={`h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/25 ${inputClassName}`}
      />
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronsUpDown className="h-4 w-4" />}
      </span>
      {state.showPanel ? (
        <ProjectAutocompletePanel
          activeIndex={state.activeIndex}
          emptyMessage={emptyMessage}
          isLoading={isLoading}
          listboxId={listboxId}
          options={options}
          value={value}
          onActiveIndexChange={state.setActiveIndex}
          onChoose={state.choose}
        />
      ) : null}
    </div>
  );
}
