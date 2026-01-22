import { useState, useCallback, useRef, useEffect } from "react";

export interface SelectOption {
    value: string;
    label: React.ReactNode;
    searchLabel?: string;
    disabled?: boolean;
}

export interface UseCustomSelectProps {
    value?: string;
    defaultValue?: string;
    options: SelectOption[];
    onChange?: (value: string) => void;
    disabled?: boolean;
    searchable?: boolean;
}

export interface UseCustomSelectReturn {
    // State
    isOpen: boolean;
    searchTerm: string;
    selectedOption: SelectOption | undefined;
    filteredOptions: SelectOption[];

    // Actions
    open: () => void;
    close: () => void;
    toggle: () => void;
    setSearchTerm: (term: string) => void;
    selectOption: (value: string) => void;

    // Props spreaders
    getTriggerProps: () => {
        onClick: () => void;
        disabled: boolean;
        "aria-expanded": boolean;
        "aria-haspopup": "listbox";
    };
    getSearchInputProps: () => {
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        autoFocus: boolean;
    };
    getOptionProps: (option: SelectOption) => {
        onClick: () => void;
        disabled: boolean;
        "aria-selected": boolean;
        role: "option";
    };
    getDropdownRef: () => React.RefObject<HTMLDivElement | null>;
}

/**
 * Headless custom select hook - provides dropdown select behavior
 * with search functionality, keyboard navigation, and click-outside handling
 */
export const useCustomSelect = ({
    value: controlledValue,
    defaultValue = "",
    options,
    onChange,
    disabled = false,
    searchable = true,
}: UseCustomSelectProps): UseCustomSelectReturn => {
    const isControlled = controlledValue !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const value = isControlled ? controlledValue : uncontrolledValue;

    // Find selected option
    const selectedOption = options.find((opt) => opt.value === value);

    // Filter options based on search
    const filteredOptions = options.filter((option) => {
        if (!searchable || !searchTerm) return true;
        const searchText =
            option.searchLabel || (typeof option.label === "string" ? option.label : "");
        return searchText.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Handle option selection
    const selectOption = useCallback(
        (optionValue: string) => {
            if (!isControlled) {
                setUncontrolledValue(optionValue);
            }
            onChange?.(optionValue);
            setIsOpen(false);
            setSearchTerm("");
        },
        [isControlled, onChange]
    );

    const open = useCallback(() => {
        if (!disabled) {
            setIsOpen(true);
        }
    }, [disabled]);

    const close = useCallback(() => {
        setIsOpen(false);
        setSearchTerm("");
    }, []);

    const toggle = useCallback(() => {
        if (!disabled) {
            if (isOpen) {
                close();
            } else {
                open();
            }
        }
    }, [disabled, isOpen, open, close]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                close();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, close]);

    // Props spreaders
    const getTriggerProps = useCallback(
        () => ({
            onClick: toggle,
            disabled,
            "aria-expanded": isOpen,
            "aria-haspopup": "listbox" as const,
        }),
        [toggle, disabled, isOpen]
    );

    const getSearchInputProps = useCallback(
        () => ({
            value: searchTerm,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
            autoFocus: true,
        }),
        [searchTerm]
    );

    const getOptionProps = useCallback(
        (option: SelectOption) => ({
            onClick: () => !option.disabled && selectOption(option.value),
            disabled: !!option.disabled,
            "aria-selected": option.value === value,
            role: "option" as const,
        }),
        [selectOption, value]
    );

    const getDropdownRef = useCallback(() => dropdownRef, []);

    return {
        isOpen,
        searchTerm,
        selectedOption,
        filteredOptions,
        open,
        close,
        toggle,
        setSearchTerm,
        selectOption,
        getTriggerProps,
        getSearchInputProps,
        getOptionProps,
        getDropdownRef,
    };
};
