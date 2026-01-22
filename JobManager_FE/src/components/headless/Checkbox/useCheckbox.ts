import { useState, useCallback, ChangeEvent } from "react";

export interface UseCheckboxProps {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    required?: boolean;
}

export interface UseCheckboxReturn {
    checkboxProps: {
        checked: boolean;
        onChange: (event: ChangeEvent<HTMLInputElement>) => void;
        disabled: boolean;
        required: boolean;
        type: "checkbox";
        role: "checkbox";
        "aria-checked": boolean;
        "aria-required"?: boolean;
    };
    checked: boolean;
    setChecked: (checked: boolean) => void;
    toggle: () => void;
}

/**
 * Headless checkbox hook - provides all checkbox behavior without any styling
 */
export const useCheckbox = ({
    checked: controlledChecked,
    defaultChecked = false,
    onChange,
    disabled = false,
    required = false,
}: UseCheckboxProps = {}): UseCheckboxReturn => {
    const isControlled = controlledChecked !== undefined;
    const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);

    const checked = isControlled ? controlledChecked : uncontrolledChecked;

    const setChecked = useCallback(
        (newChecked: boolean) => {
            if (!isControlled) {
                setUncontrolledChecked(newChecked);
            }
        },
        [isControlled]
    );

    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const newChecked = event.target.checked;

            if (!isControlled) {
                setUncontrolledChecked(newChecked);
            }

            onChange?.(newChecked, event);
        },
        [onChange, isControlled]
    );

    const toggle = useCallback(() => {
        if (!disabled) {
            const newChecked = !checked;
            if (!isControlled) {
                setUncontrolledChecked(newChecked);
            }
            // Create synthetic event for toggle
            const syntheticEvent = {
                target: { checked: newChecked },
            } as ChangeEvent<HTMLInputElement>;
            onChange?.(newChecked, syntheticEvent);
        }
    }, [checked, disabled, isControlled, onChange]);

    return {
        checkboxProps: {
            checked,
            onChange: handleChange,
            disabled,
            required,
            type: "checkbox",
            role: "checkbox",
            "aria-checked": checked,
            ...(required && { "aria-required": true }),
        },
        checked,
        setChecked,
        toggle,
    };
};
