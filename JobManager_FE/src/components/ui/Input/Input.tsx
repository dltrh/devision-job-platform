import React from "react";
import clsx from "clsx";
import { useInput } from "@/components/headless";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
    endAdornment?: React.ReactNode;
    onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
    validate?: (value: string) => string | undefined;
}

export const Input: React.FC<InputProps> = ({
    label,
    error: externalError,
    helperText,
    fullWidth = false,
    endAdornment,
    className,
    id,
    value,
    defaultValue,
    onChange,
    onBlur,
    onFocus,
    disabled,
    readOnly,
    required,
    validate,
    type,
    ...props
}) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    // Use headless input hook for behavior
    const { inputProps, error: validationError } = useInput({
        value,
        defaultValue,
        onChange,
        onBlur,
        onFocus,
        disabled,
        readOnly,
        required,
        validate,
        type,
    });

    // External error takes precedence over validation error
    const error = externalError || validationError;

    return (
        <div className={clsx("flex flex-col gap-1", fullWidth && "w-full")}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-gray-700"
                >
                    {label}
                </label>
            )}
            <div className={clsx("relative", fullWidth && "w-full")}>
                <input
                    {...inputProps}
                    {...props}
                    id={inputId}
                    className={clsx(
                        "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors",
                        "text-gray-900 placeholder:text-gray-400",
                        endAdornment && "pr-12",
                        error
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
                        disabled && "bg-gray-100 cursor-not-allowed",
                        className,
                    )}
                />

                {endAdornment && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        {endAdornment}
                    </div>
                )}
            </div>
            {error && <span className="text-sm text-red-600">{error}</span>}
            {helperText && !error && (
                <span className="text-sm text-gray-500">{helperText}</span>
            )}
        </div>
    );
};
