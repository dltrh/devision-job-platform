import React, { useCallback, memo } from "react";
import clsx from "clsx";

export interface OptionItem<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface OptionSelectorProps<T extends string = string> {
  /** Available options to select from */
  options: OptionItem<T>[];
  /** Currently selected value */
  value: T;
  /** Callback when selection changes */
  onChange: (value: T) => void;
  /** Label displayed above the selector */
  label?: string;
  /** Number of columns in the grid (default: options.length) */
  columns?: number;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether the entire selector is disabled */
  disabled?: boolean;
  /** Additional class names for the container */
  className?: string;
}

const sizeStyles = {
  sm: "p-2",
  md: "p-3",
  lg: "p-4",
};

const iconSizeStyles = {
  sm: "[&_svg]:w-4 [&_svg]:h-4",
  md: "[&_svg]:w-5 [&_svg]:h-5",
  lg: "[&_svg]:w-6 [&_svg]:h-6",
};

const labelSizeStyles = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
};

function OptionSelectorInner<T extends string = string>({
  options,
  value,
  onChange,
  label,
  columns,
  size = "md",
  disabled = false,
  className,
}: OptionSelectorProps<T>) {
  const gridCols = columns || options.length;

  const handleOptionClick = useCallback(
    (optionValue: T, optionDisabled?: boolean) => {
      if (!disabled && !optionDisabled) {
        onChange(optionValue);
      }
    },
    [disabled, onChange]
  );

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = disabled || option.disabled;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleOptionClick(option.value, option.disabled)}
              disabled={isDisabled}
              className={clsx(
                "flex flex-col items-center rounded-lg border-2 transition-colors",
                sizeStyles[size],
                iconSizeStyles[size],
                isDisabled && "cursor-not-allowed opacity-50",
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              )}
            >
              {option.icon}
              <span className={clsx("mt-1", labelSizeStyles[size])}>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Memoize the component
export const OptionSelector = memo(OptionSelectorInner) as typeof OptionSelectorInner;

export default OptionSelector;
