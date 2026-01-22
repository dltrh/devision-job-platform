import React from "react";
import clsx from "clsx";
import { useCheckbox } from "@/components/headless";

export interface CheckboxProps extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange"
> {
    label?: string;
    error?: string;
    helperText?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    label,
    error,
    helperText,
    className,
    id,
    checked,
    defaultChecked,
    onChange,
    disabled,
    required,
    ...props
}) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");

    // Use headless hook for checkbox behavior
    const { checkboxProps, checked: isChecked } = useCheckbox({
        checked,
        defaultChecked,
        onChange: (newChecked) => onChange?.(newChecked),
        disabled,
        required,
    });

    return (
        <div className="flex flex-col gap-1">
            <label
                htmlFor={checkboxId}
                className={clsx(
                    "flex items-center gap-2 cursor-pointer",
                    disabled && "cursor-not-allowed opacity-50"
                )}
            >
                <input
                    id={checkboxId}
                    {...checkboxProps}
                    className={clsx(
                        "w-4 h-4 rounded border-gray-300 accent-blue-600",
                        "focus:ring-2 focus:ring-blue-500 focus:ring-offset-0",
                        "transition-colors cursor-pointer",
                        error && "border-red-500",
                        disabled && "cursor-not-allowed",
                        className
                    )}
                    {...props}
                />
                {label && <span className="text-sm text-gray-700">{label}</span>}
            </label>
            {error && <span className="text-sm text-red-600">{error}</span>}
            {helperText && !error && <span className="text-sm text-gray-500">{helperText}</span>}
        </div>
    );
};
