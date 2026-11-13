import type { LucideIcon } from 'lucide-react';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

/** Two-to-four mutually exclusive modes, e.g. "2 Wayang" vs "1 Wayang". */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex flex-wrap gap-1 rounded-lg border border-wayang-brown/15 bg-white p-1"
    >
      {options.map(({ value: optionValue, label, icon: Icon }) => {
        const active = optionValue === value;
        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(optionValue)}
            className={`btn btn-sm ${
              active
                ? 'bg-wayang-brown text-wayang-cream'
                : 'text-wayang-brown hover:bg-wayang-gold-soft/60'
            }`}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {label}
          </button>
        );
      })}
    </div>
  );
}
