import React from "react";
import clsx from "clsx";
import { useCustomSelect, SelectOption } from "@/components/headless/Select";

export type { SelectOption };

export interface SelectProps {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
    options: SelectOption[];
    value?: string;
    onChange?: (e: { target: { value: string } }) => void;
    disabled?: boolean;
    id?: string;
    className?: string;
    /** Whether to show search input in dropdown (default: true) */
    searchable?: boolean;
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    helperText,
    fullWidth = false,
    options,
    className,
    id,
    value,
    disabled,
    onChange,
    searchable = true,
}) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    // Use headless hook for select behavior
    const {
        isOpen,
        selectedOption,
        filteredOptions,
        getTriggerProps,
        getSearchInputProps,
        getOptionProps,
        getDropdownRef,
        close,
    } = useCustomSelect({
        value,
        options,
        onChange: (newValue) => onChange?.({ target: { value: newValue } }),
        disabled,
        searchable,
    });

    const dropdownRef = getDropdownRef();
    const triggerProps = getTriggerProps();
    const searchInputProps = getSearchInputProps();

    return (
        <div className={clsx("flex flex-col gap-1", fullWidth && "w-full")} ref={dropdownRef}>
            {label && (
                <label htmlFor={selectId} className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            {/* Dropdown Trigger Button */}
            <div className="relative">
                <button
                    type="button"
                    id={selectId}
                    {...triggerProps}
                    className={clsx(
                        "w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between transition-colors",
                        error
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500",
                        disabled
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white hover:border-gray-400 cursor-pointer",
                        className
                    )}
                >
                    <span
                        className={clsx(
                            "text-sm truncate",
                            selectedOption?.value ? "text-gray-900" : "text-gray-500"
                        )}
                    >
                        {selectedOption?.label || "Select an option"}
                    </span>
                    <svg
                        className={clsx(
                            "w-4 h-4 flex-shrink-0 transition-transform",
                            isOpen && "rotate-180"
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={close} />
                        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                            {/* Search Input - only show when searchable */}
                            {searchable && (
                                <div className="p-2 border-b border-gray-200">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        {...searchInputProps}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}

                            {/* Options List */}
                            <div className="overflow-y-auto max-h-64" role="listbox">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((option) => {
                                        const optionProps = getOptionProps(option);
                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                {...optionProps}
                                                className={clsx(
                                                    "w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center justify-between cursor-pointer",
                                                    option.value === value
                                                        ? "bg-blue-100 text-blue-900 font-medium"
                                                        : "text-gray-700",
                                                    option.disabled &&
                                                        "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                <span>{option.label}</span>
                                                {option.value === value && (
                                                    <svg
                                                        className="w-4 h-4 text-blue-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                        No options found
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {error && <span className="text-sm text-red-600">{error}</span>}
            {helperText && !error && <span className="text-sm text-gray-500">{helperText}</span>}
        </div>
    );
};
