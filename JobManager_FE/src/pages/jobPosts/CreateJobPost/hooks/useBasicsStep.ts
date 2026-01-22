import { useMemo, useCallback } from "react";
import { JobPostFormData, JobPostFormErrors } from "../types";
import { EMPLOYMENT_TYPES, EMPLOYMENT_TYPE_LABELS } from "@/utils/constants";
import { EmploymentType } from "@/types";

// ============================================================================
// Types
// ============================================================================

export interface EmploymentTypeOption {
    type: EmploymentType;
    label: string;
    isSelected: boolean;
    isDisabled: boolean;
    disabledReason?: string;
    canCombine: boolean;
}

export interface UseBasicsStepProps {
    formData: JobPostFormData;
    errors: JobPostFormErrors;
    onChange: (field: keyof JobPostFormData, value: any) => void;
}

export interface UseBasicsStepReturn {
    // Title
    title: {
        value: string;
        error?: string;
        onChange: (value: string) => void;
    };

    // Employment Types
    employmentTypes: {
        selected: EmploymentType[];
        options: EmploymentTypeOption[];
        error?: string;
        toggle: (type: EmploymentType) => void;
        getOptionProps: (option: EmploymentTypeOption) => {
            isSelected: boolean;
            isDisabled: boolean;
            onChange: () => void;
            "aria-checked": boolean;
            "aria-disabled": boolean;
        };
    };

    // Fresher Friendly
    fresher: {
        isChecked: boolean;
        toggle: () => void;
        onChange: (checked: boolean) => void;
    };
}

// ============================================================================
// Constants
// ============================================================================

const COMBINABLE_TYPES: EmploymentType[] = [EMPLOYMENT_TYPES.INTERNSHIP, EMPLOYMENT_TYPES.CONTRACT];

// ============================================================================
// Hook
// ============================================================================

/**
 * Headless hook for Step 1: Basics
 * Manages job title, employment types with complex selection rules, and fresher toggle
 */
export const useBasicsStep = ({
    formData,
    errors,
    onChange,
}: UseBasicsStepProps): UseBasicsStepReturn => {
    // -------------------------------------------------------------------------
    // Employment Type Logic
    // -------------------------------------------------------------------------

    const toggleEmploymentType = useCallback(
        (type: EmploymentType) => {
            const current = formData.employmentTypes;
            const updated = current.includes(type)
                ? current.filter((t) => t !== type)
                : [...current, type];

            onChange("employmentTypes", updated);
        },
        [formData.employmentTypes, onChange]
    );

    const employmentTypeOptions = useMemo<EmploymentTypeOption[]>(() => {
        const keys = Object.keys(EMPLOYMENT_TYPES) as Array<keyof typeof EMPLOYMENT_TYPES>;

        return keys
            .filter((key) => EMPLOYMENT_TYPES[key] !== EMPLOYMENT_TYPES.FRESHER)
            .map((key) => {
                const type = EMPLOYMENT_TYPES[key];
                const isSelected = formData.employmentTypes.includes(type);
                const isCombinable = COMBINABLE_TYPES.includes(type);

                // Check if other non-combinable types are selected
                const hasNonCombinableSelected = formData.employmentTypes.some(
                    (t) => !COMBINABLE_TYPES.includes(t)
                );

                // Check if any type is already selected
                const hasAnySelected = formData.employmentTypes.length > 0;

                // Disable logic:
                // - Combinable types (Internship/Contract) disabled if non-combinable selected
                // - Non-combinable types disabled if any other type is selected (unless it's the same one)
                let isDisabled = false;
                let disabledReason: string | undefined;

                if (isCombinable) {
                    isDisabled = hasNonCombinableSelected;
                    if (isDisabled) {
                        disabledReason = "Cannot combine with Full-time or Part-time";
                    }
                } else {
                    isDisabled = hasAnySelected && !isSelected;
                    if (isDisabled) {
                        disabledReason = "Only Internship and Contract can be combined together";
                    }
                }

                return {
                    type,
                    label: EMPLOYMENT_TYPE_LABELS[type],
                    isSelected,
                    isDisabled,
                    disabledReason,
                    canCombine: isCombinable,
                };
            });
    }, [formData.employmentTypes]);

    const getOptionProps = useCallback(
        (option: EmploymentTypeOption) => ({
            isSelected: option.isSelected,
            isDisabled: option.isDisabled,
            onChange: () => toggleEmploymentType(option.type),
            "aria-checked": option.isSelected,
            "aria-disabled": option.isDisabled,
        }),
        [toggleEmploymentType]
    );

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    return {
        title: {
            value: formData.title,
            error: errors.title,
            onChange: (value: string) => onChange("title", value),
        },

        employmentTypes: {
            selected: formData.employmentTypes,
            options: employmentTypeOptions,
            error: errors.employmentTypes,
            toggle: toggleEmploymentType,
            getOptionProps,
        },

        fresher: {
            isChecked: formData.isFresher,
            toggle: () => onChange("isFresher", !formData.isFresher),
            onChange: (checked: boolean) => onChange("isFresher", checked),
        },
    };
};
