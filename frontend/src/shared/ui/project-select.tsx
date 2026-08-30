'use client';

import { Check, ChevronDown } from 'lucide-react';
import { Select } from 'radix-ui';

import styles from './project-dropdown.module.css';

export type ProjectSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  options: ProjectSelectOption[];
  ariaLabel: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  size?: 'default' | 'compact';
};

export function ProjectSelect({
  value,
  onValueChange,
  options,
  ariaLabel,
  className = '',
  placeholder,
  disabled = false,
  size = 'default',
}: Props) {
  const sizeClassName = size === 'compact' ? 'h-10 text-xs' : 'h-11 text-sm';

  return (
    <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <Select.Trigger
        aria-label={ariaLabel}
        className={`${styles.trigger} relative flex w-full cursor-pointer items-center rounded-lg border border-foreground/10 bg-foreground/[0.025] px-3 pr-10 text-left text-foreground/75 outline-none transition-colors hover:border-foreground/20 focus:border-foreground/30 disabled:cursor-not-allowed disabled:opacity-45 ${sizeClassName} ${className}`}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon asChild>
          <ChevronDown className={`${styles.chevron} pointer-events-none absolute right-3.5 h-4 w-4 text-foreground/45 transition-transform duration-200`} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className={styles.content}
        >
          <Select.Viewport className={styles.viewport}>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={styles.item}
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className={styles.indicator}>
                  <Check className="h-3.5 w-3.5" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
