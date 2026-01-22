import { useState, useCallback, ChangeEvent, FocusEvent } from "react";

export interface UseSelectProps<T = string> {
    value?: T;
    defaultValue?: T;
    onChange?: (value: T, event: ChangeEvent<HTMLSelectElement>) => void;
    onBlur?: (event: FocusEvent<HTMLSelectElement>) => void;
    onFocus?: (event: FocusEvent<HTMLSelectElement>) => void;
    disabled?: boolean;
    required?: boolean;
    validate?: (value: T) => string | undefined;
}

export interface UseSelectReturn<T = string> {
    selectProps: {
        value: T;
        onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
        onBlur: (event: FocusEvent<HTMLSelectElement>) => void;
        onFocus: (event: FocusEvent<HTMLSelectElement>) => void;
        disabled: boolean;
        required: boolean;
        "aria-invalid"?: boolean;
        "aria-required"?: boolean;
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
 * Headless select hook - provides all select behavior without any styling
 */
export const useSelect = <T = string>({
    value: controlledValue,
    defaultValue = "" as T,
    onChange,
    onBlur,
    onFocus,
    disabled = false,
    required = false,
    validate,
}: UseSelectProps<T> = {}): UseSelectReturn<T> => {
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
        (event: ChangeEvent<HTMLSelectElement>) => {
            const newValue = event.target.value as T;

            if (!isControlled) {
                setUncontrolledValue(newValue);
            }

            setError(undefined);
            onChange?.(newValue, event);
        },
        [onChange, isControlled]
    );

    const handleBlur = useCallback(
        (event: FocusEvent<HTMLSelectElement>) => {
            setIsFocused(false);
            setIsTouched(true);

            if (validate) {
                const validationError = validate(value);
                setError(validationError);
            }

            onBlur?.(event);
        },
        [onBlur, validate, value]
    );

    const handleFocus = useCallback(
        (event: FocusEvent<HTMLSelectElement>) => {
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
        selectProps: {
            value,
            onChange: handleChange,
            onBlur: handleBlur,
            onFocus: handleFocus,
            disabled,
            required,
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
