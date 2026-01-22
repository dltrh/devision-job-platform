import React from "react";
import clsx from "clsx";

export interface RadioOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface RadioGroupProps {
    name: string;
    options: RadioOption[];
    value?: string;
    onChange: (value: string | undefined) => void;
    label?: string;
    error?: string;
    helperText?: string;
    disabled?: boolean;
    className?: string;
    /** If true, clicking a selected option will deselect it */
    allowDeselect?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
    name,
    options,
    value,
    onChange,
    label,
    error,
    helperText,
    disabled = false,
    className,
    allowDeselect = false,
}) => {
    const handleChange = (optionValue: string) => {
        if (allowDeselect && value === optionValue) {
            onChange(undefined);
        } else {
            onChange(optionValue);
        }
    };

    return (
        <div className={clsx("flex flex-col gap-1", className)}>
            {label && (
                <span className="text-sm font-medium text-gray-700 mb-1">
                    {label}
                </span>
            )}
            <div className="space-y-2">
                {options.map((option) => {
                    const isDisabled = disabled || option.disabled;
                    const isChecked = value === option.value;
                    const optionId = `${name}-${option.value}`;

                    return (
                        <label
                            key={option.value}
                            htmlFor={optionId}
                            className={clsx(
                                "flex items-center gap-2 cursor-pointer",
                                isDisabled && "cursor-not-allowed opacity-50"
                            )}
                        >
                            <input
                                id={optionId}
                                type="checkbox"
                                name={name}
                                checked={isChecked}
                                onChange={() => handleChange(option.value)}
                                disabled={isDisabled}
                                className={clsx(
                                    "w-4 h-4 rounded border-gray-300 accent-blue-600",
                                    "focus:ring-2 focus:ring-blue-500 focus:ring-offset-0",
                                    "transition-colors cursor-pointer",
                                    error && "border-red-500",
                                    isDisabled && "cursor-not-allowed"
                                )}
                            />
                            <span className="text-sm text-gray-700">
                                {option.label}
                            </span>
                        </label>
                    );
                })}
            </div>
            {error && <span className="text-sm text-red-600 mt-1">{error}</span>}
            {helperText && !error && (
                <span className="text-sm text-gray-500 mt-1">{helperText}</span>
            )}
        </div>
    );
};
