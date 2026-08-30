import { Check } from 'lucide-react';

import styles from './project-dropdown.module.css';
import type { ProjectAutocompleteOption } from './project-autocomplete-types';

type Props = {
  activeIndex: number;
  emptyMessage: string;
  isLoading: boolean;
  listboxId: string;
  options: ProjectAutocompleteOption[];
  value: string;
  onActiveIndexChange: (index: number) => void;
  onChoose: (option: ProjectAutocompleteOption) => void;
};

export function ProjectAutocompletePanel(props: Props) {
  return (
    <div id={props.listboxId} role="listbox" className={styles.autocompletePanel}>
      {props.options.length ? props.options.map((option, index) => (
        <button
          key={option.id}
          id={`${props.listboxId}-${option.id}`}
          type="button"
          role="option"
          aria-selected={index === props.activeIndex}
          data-active={index === props.activeIndex}
          className={styles.autocompleteItem}
          onMouseDown={(event) => event.preventDefault()}
          onMouseEnter={() => props.onActiveIndexChange(index)}
          onClick={() => props.onChoose(option)}
        >
          <span className={styles.autocompleteText}>
            <span className={styles.autocompleteLabel}>{option.label || option.value}</span>
            {option.description ? (
              <span className={styles.autocompleteDescription}>{option.description}</span>
            ) : null}
          </span>
          {option.value === props.value ? (
            <Check className="h-3.5 w-3.5 shrink-0 text-brand-300" />
          ) : null}
        </button>
      )) : (
        <p className={styles.autocompleteState}>
          {props.isLoading ? 'Ищем варианты…' : props.emptyMessage}
        </p>
      )}
    </div>
  );
}
