import { useState, useCallback, ChangeEvent, FocusEvent } from "react";

export interface UseInputProps<T = string> {
    value?: T;
    defaultValue?: T;
    onChange?: (value: T, event: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
    onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    validate?: (value: T) => string | undefined;
    type?: string;
}

export interface UseInputReturn<T = string> {
    inputProps: {
        value: T;
        onChange: (event: ChangeEvent<HTMLInputElement>) => void;
        onBlur: (event: FocusEvent<HTMLInputElement>) => void;
        onFocus: (event: FocusEvent<HTMLInputElement>) => void;
        disabled: boolean;
        readOnly: boolean;
        required: boolean;
        "aria-invalid"?: boolean;
        "aria-required"?: boolean;
        type: string;
    };
    value: T;
    error: string | undefined;
    isFocused: boolean;
    isTouched: boolean;
    isDirty: boolean;
    isValid: boolean;
    setValue: (value: T) => void;
    setError: (error: string | undefined) => void;
    reset: () => void;
}

/**
 * Headless input hook - provides all input behavior without any styling
 * Handles value state, validation, touched state, focus state, and error management
 */
export const useInput = <T = string>({
    value: controlledValue,
    defaultValue = "" as T,
    onChange,
    onBlur,
    onFocus,
    disabled = false,
    readOnly = false,
    required = false,
    validate,
    type = "text",
}: UseInputProps<T> = {}): UseInputReturn<T> => {
    const isControlled = controlledValue !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<T>(defaultValue);
    const [error, setError] = useState<string | undefined>();
    const [isFocused, setIsFocused] = useState(false);
    const [isTouched, setIsTouched] = useState(false);

    const value = isControlled ? controlledValue : uncontrolledValue;
    const isDirty = value !== defaultValue;
    const isValid = !error;

    const setValue = useCallback(
        (newValue: T) => {
            if (!isControlled) {
                setUncontrolledValue(newValue);
            }
        },
        [isControlled]
    );

    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value as T;

            if (!isControlled) {
                setUncontrolledValue(newValue);
            }

            // Clear error on change
            setError(undefined);

            onChange?.(newValue, event);
        },
        [onChange, isControlled]
    );

    const handleBlur = useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            setIsTouched(true);

            // Validate on blur
            if (validate) {
                const validationError = validate(value);
                setError(validationError);
            }

            onBlur?.(event);
        },
        [onBlur, validate, value]
    );

    const handleFocus = useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            onFocus?.(event);
        },
        [onFocus]
    );

    const reset = useCallback(() => {
        if (!isControlled) {
            setUncontrolledValue(defaultValue);
        }
        setError(undefined);
        setIsFocused(false);
        setIsTouched(false);
    }, [isControlled, defaultValue]);

    return {
        inputProps: {
            value,
            onChange: handleChange,
            onBlur: handleBlur,
            onFocus: handleFocus,
            disabled,
            readOnly,
            required,
            type,
            ...(error && { "aria-invalid": true }),
            ...(required && { "aria-required": true }),
        },
        value,
        error,
        isFocused,
        isTouched,
        isDirty,
        isValid,
        setValue,
        setError,
        reset,
    };
};
