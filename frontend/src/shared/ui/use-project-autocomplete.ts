import { useState, type KeyboardEvent } from 'react';

import type { ProjectAutocompleteOption } from './project-autocomplete-types';

export function useProjectAutocomplete(params: {
  minChars: number;
  onSelect?: (option: ProjectAutocompleteOption) => void;
  onValueChange: (value: string) => void;
  options: ProjectAutocompleteOption[];
  value: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const canShow = params.value.trim().length >= params.minChars;
  const showPanel = isOpen && canShow;

  function choose(option: ProjectAutocompleteOption) {
    params.onValueChange(option.value);
    params.onSelect?.(option);
    setIsOpen(false);
    setActiveIndex(0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) =>
        params.options.length ? Math.min(current + 1, params.options.length - 1) : 0
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter' && showPanel && params.options[activeIndex]) {
      event.preventDefault();
      choose(params.options[activeIndex]);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }

  function handleChange(value: string) {
    params.onValueChange(value);
    setActiveIndex(0);
    setIsOpen(true);
  }

  return {
    activeIndex,
    canShow,
    choose,
    handleChange,
    handleKeyDown,
    setActiveIndex,
    setIsOpen,
    showPanel,
  };
}
