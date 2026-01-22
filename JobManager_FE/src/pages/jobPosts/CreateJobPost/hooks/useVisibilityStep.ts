import { useMemo, useCallback } from "react";
import { JobPostFormData, JobPostFormErrors } from "../types";

// ============================================================================
// Types
// ============================================================================

export interface VisibilityOption {
    value: boolean;
    label: string;
    icon: string;
    description: string;
    isRecommended?: boolean;
}

export interface FormSummaryItem {
    label: string;
    value: string;
}

export interface UseVisibilityStepProps {
    formData: JobPostFormData;
    errors: JobPostFormErrors;
    onChange: (field: keyof JobPostFormData, value: any) => void;
    onSaveDraft: () => void;
    onPublish: () => void;
    isSaving: boolean;
    showPreview: () => void;
}

export interface UseVisibilityStepReturn {
    // Visibility
    visibility: {
        isPrivate: boolean;
        options: VisibilityOption[];
        setVisibility: (isPrivate: boolean) => void;
        getOptionProps: (option: VisibilityOption) => {
            isSelected: boolean;
            onChange: () => void;
            "aria-checked": boolean;
            role: "radio";
        };
    };

    // Expiry Date
    expiry: {
        value: string;
        minDate: string;
        defaultDate: string;
        hasValue: boolean;
        onChange: (value: string) => void;
        setDefault: () => void;
        error?: string;
    };

    // Form Summary
    summary: {
        items: FormSummaryItem[];
        isComplete: boolean;
    };

    // Actions
    actions: {
        saveDraft: () => void;
        publish: () => void;
        preview: () => void;
        isSaving: boolean;
        canSave: boolean;
        canPublish: boolean;
    };
}

// ============================================================================
// Constants
// ============================================================================

const VISIBILITY_OPTIONS: VisibilityOption[] = [
    {
        value: false,
        label: "Public",
        icon: "🌐",
        description: "Visible to all job seekers and search engines. Maximum reach.",
        isRecommended: true,
    },
    {
        value: true,
        label: "Private",
        icon: "🔒",
        description: "Only accessible via direct link. Not searchable.",
    },
];

const DEFAULT_EXPIRY_DAYS = 30;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate date N days from now in ISO format (YYYY-MM-DD)
 */
const getDateFromNow = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Headless hook for Step 4: Visibility & Publish
 * Manages visibility toggle, expiry date, form summary, and publish actions
 */
export const useVisibilityStep = ({
    formData,
    errors,
    onChange,
    onSaveDraft,
    onPublish,
    isSaving,
    showPreview,
}: UseVisibilityStepProps): UseVisibilityStepReturn => {
    // -------------------------------------------------------------------------
    // Memoized Values
    // -------------------------------------------------------------------------

    const minDate = useMemo(() => getDateFromNow(1), []);
    const defaultExpiryDate = useMemo(() => getDateFromNow(DEFAULT_EXPIRY_DAYS), []);

    const summaryItems = useMemo<FormSummaryItem[]>(
        () => [
            {
                label: "Job Title",
                value: formData.title || "Not set",
            },
            {
                label: "Employment Types",
                value:
                    formData.employmentTypes.length > 0
                        ? `${formData.employmentTypes.length} selected`
                        : "None",
            },
            {
                label: "Location",
                value: formData.locationCity || "Not set",
            },
            {
                label: "Skills",
                value: `${formData.technicalSkills.length} added`,
            },
            {
                label: "Visibility",
                value: formData.isPrivate ? "🔒 Private" : "🌐 Public",
            },
        ],
        [
            formData.title,
            formData.employmentTypes,
            formData.locationCity,
            formData.technicalSkills,
            formData.isPrivate,
        ]
    );

    const isFormComplete = useMemo(() => {
        return !!(
            formData.title &&
            formData.employmentTypes.length > 0 &&
            formData.locationCity &&
            formData.description
        );
    }, [formData.title, formData.employmentTypes, formData.locationCity, formData.description]);

    // -------------------------------------------------------------------------
    // Callbacks
    // -------------------------------------------------------------------------

    const setVisibility = useCallback(
        (isPrivate: boolean) => {
            onChange("isPrivate", isPrivate);
        },
        [onChange]
    );

    const setExpiryDate = useCallback(
        (value: string) => {
            onChange("expiryAt", value);
        },
        [onChange]
    );

    const setDefaultExpiry = useCallback(() => {
        onChange("expiryAt", defaultExpiryDate);
    }, [onChange, defaultExpiryDate]);

    const getOptionProps = useCallback(
        (option: VisibilityOption) => ({
            isSelected: formData.isPrivate === option.value,
            onChange: () => setVisibility(option.value),
            "aria-checked": formData.isPrivate === option.value,
            role: "radio" as const,
        }),
        [formData.isPrivate, setVisibility]
    );

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    return {
        visibility: {
            isPrivate: formData.isPrivate,
            options: VISIBILITY_OPTIONS,
            setVisibility,
            getOptionProps,
        },

        expiry: {
            value: formData.expiryAt,
            minDate,
            defaultDate: defaultExpiryDate,
            hasValue: !!formData.expiryAt,
            onChange: setExpiryDate,
            setDefault: setDefaultExpiry,
            error: errors.expiryAt,
        },

        summary: {
            items: summaryItems,
            isComplete: isFormComplete,
        },

        actions: {
            saveDraft: onSaveDraft,
            publish: onPublish,
            preview: showPreview,
            isSaving,
            canSave: !isSaving,
            canPublish: !isSaving && isFormComplete,
        },
    };
};
