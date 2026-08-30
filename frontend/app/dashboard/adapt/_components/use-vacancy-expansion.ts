import { useState, type SetStateAction } from 'react';

export function useVacancyExpansion(shouldCollapse: boolean, isBusy: boolean) {
  const key = `${shouldCollapse}:${isBusy}`;
  const defaultExpanded = !shouldCollapse || isBusy;
  const [state, setState] = useState({ key, value: defaultExpanded });
  const isExpanded = state.key === key ? state.value : defaultExpanded;

  function setIsExpanded(action: SetStateAction<boolean>) {
    setState((current) => {
      const currentValue = current.key === key ? current.value : defaultExpanded;
      return {
        key,
        value: typeof action === 'function' ? action(currentValue) : action,
      };
    });
  }

  return [isExpanded, setIsExpanded] as const;
}
