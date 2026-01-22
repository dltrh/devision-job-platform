import { useState, useEffect, useMemo, useCallback } from "react";
import { JobPostFormData, JobPostFormErrors } from "../types";
import { SALARY_TYPES, SALARY_TYPE_LABELS } from "@/utils/constants";
import { SalaryType } from "@/types";
import httpClient from "@/services/httpClient";

// ============================================================================
// Types
// ============================================================================

export interface SalaryTypeOption {
    value: SalaryType | "";
    label: string;
}

export interface CountryOption {
    value: string;
    label: string;
}

export interface SalaryInputConfig {
    type: "range" | "single-min" | "single-max" | "negotiable" | "none";
    showMin: boolean;
    showMax: boolean;
    minLabel?: string;
    maxLabel?: string;
    helperText?: string;
}

export interface UseCompensationStepProps {
    formData: JobPostFormData;
    errors: JobPostFormErrors;
    onChange: (field: keyof JobPostFormData, value: any) => void;
}

export interface UseCompensationStepReturn {
    // Salary Type
    salaryType: {
        value: SalaryType | "";
        options: SalaryTypeOption[];
        error?: string;
        onChange: (value: SalaryType | "") => void;
    };

    // Salary Inputs
    salary: {
        config: SalaryInputConfig;
        min: {
            value: string;
            error?: string;
            onChange: (value: string) => void;
        };
        max: {
            value: string;
            error?: string;
            onChange: (value: string) => void;
        };
    };

    // Salary Note
    salaryNote: {
        value: string;
        isVisible: boolean;
        show: () => void;
        hide: () => void;
        onChange: (value: string) => void;
    };

    // Location
    location: {
        country: {
            options: CountryOption[];
            isLoading: boolean;
            error: string | null;
        };
        city: {
            value: string;
            error?: string;
            onChange: (value: string) => void;
        };
    };
}

// ============================================================================
// Constants
// ============================================================================

const SALARY_TYPE_OPTIONS: SalaryTypeOption[] = [
    { value: "", label: "Select salary type" },
    ...Object.keys(SALARY_TYPES).map((key) => ({
        value: SALARY_TYPES[key as keyof typeof SALARY_TYPES],
        label: SALARY_TYPE_LABELS[SALARY_TYPES[key as keyof typeof SALARY_TYPES]],
    })),
];

// ============================================================================
// Helper Functions
// ============================================================================

const getSalaryInputConfig = (salaryType: SalaryType | ""): SalaryInputConfig => {
    switch (salaryType) {
        case SALARY_TYPES.RANGE:
            return {
                type: "range",
                showMin: true,
                showMax: true,
                minLabel: "Minimum Salary *",
                maxLabel: "Maximum Salary *",
            };
        case SALARY_TYPES.ABOUT:
            return {
                type: "single-min",
                showMin: true,
                showMax: false,
                minLabel: "Estimated Salary *",
                helperText: "An approximate salary amount",
            };
        case SALARY_TYPES.UP_TO:
            return {
                type: "single-max",
                showMin: false,
                showMax: true,
                maxLabel: "Maximum Salary *",
                helperText: "The highest salary offered",
            };
        case SALARY_TYPES.FROM:
            return {
                type: "single-min",
                showMin: true,
                showMax: false,
                minLabel: "Starting Salary *",
                helperText: "Minimum salary, with potential for more",
            };
        case SALARY_TYPES.NEGOTIABLE:
            return {
                type: "negotiable",
                showMin: false,
                showMax: false,
            };
        default:
            return {
                type: "none",
                showMin: false,
                showMax: false,
            };
    }
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Headless hook for Step 2: Compensation & Location
 * Manages salary type, salary inputs, salary note, and location with country fetching
 */
export const useCompensationStep = ({
    formData,
    errors,
    onChange,
}: UseCompensationStepProps): UseCompensationStepReturn => {
    // -------------------------------------------------------------------------
    // Local State
    // -------------------------------------------------------------------------

    const [showSalaryNote, setShowSalaryNote] = useState(false);
    const [countryList, setCountryList] = useState<Array<{ code: string; displayName: string }>>(
        []
    );
    const [countryLoading, setCountryLoading] = useState(true);
    const [countryError, setCountryError] = useState<string | null>(null);

    // -------------------------------------------------------------------------
    // Effects
    // -------------------------------------------------------------------------

    // Fetch countries from API
    useEffect(() => {
        let isMounted = true;
        setCountryLoading(true);
        setCountryError(null);

        httpClient
            .get("/auth/countries")
            .then((res: any) => {
                if (isMounted) {
                    setCountryList(res.data.data || []);
                    setCountryLoading(false);
                }
            })
            .catch((err: any) => {
                if (isMounted) {
                    setCountryError("Failed to load country list");
                    setCountryLoading(false);
                    console.error("Error fetching countries:", err);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Auto-show salary note if type is NEGOTIABLE
    useEffect(() => {
        if (formData.salaryType === SALARY_TYPES.NEGOTIABLE) {
            setShowSalaryNote(true);
        }
    }, [formData.salaryType]);

    // -------------------------------------------------------------------------
    // Memoized Values
    // -------------------------------------------------------------------------

    const salaryConfig = useMemo(
        () => getSalaryInputConfig(formData.salaryType as SalaryType | ""),
        [formData.salaryType]
    );

    const countryOptions = useMemo<CountryOption[]>(
        () => [
            { value: "", label: "Select a country" },
            ...countryList.map((country) => ({
                value: country.code,
                label: country.displayName,
            })),
        ],
        [countryList]
    );

    // -------------------------------------------------------------------------
    // Callbacks
    // -------------------------------------------------------------------------

    const setSalaryType = useCallback(
        (value: SalaryType | "") => {
            onChange("salaryType", value);
        },
        [onChange]
    );

    const setSalaryMin = useCallback(
        (value: string) => {
            onChange("salaryMin", value);
        },
        [onChange]
    );

    const setSalaryMax = useCallback(
        (value: string) => {
            onChange("salaryMax", value);
        },
        [onChange]
    );

    const setSalaryNote = useCallback(
        (value: string) => {
            onChange("salaryNote", value);
        },
        [onChange]
    );

    const setCity = useCallback(
        (value: string) => {
            onChange("locationCity", value);
        },
        [onChange]
    );

    // -------------------------------------------------------------------------
    // Return
    // -------------------------------------------------------------------------

    return {
        salaryType: {
            value: formData.salaryType as SalaryType | "",
            options: SALARY_TYPE_OPTIONS,
            error: errors.salaryType,
            onChange: setSalaryType,
        },

        salary: {
            config: salaryConfig,
            min: {
                value: formData.salaryMin,
                error: errors.salaryMin,
                onChange: setSalaryMin,
            },
            max: {
                value: formData.salaryMax,
                error: errors.salaryMax,
                onChange: setSalaryMax,
            },
        },

        salaryNote: {
            value: formData.salaryNote,
            isVisible: showSalaryNote,
            show: () => setShowSalaryNote(true),
            hide: () => setShowSalaryNote(false),
            onChange: setSalaryNote,
        },

        location: {
            country: {
                options: countryOptions,
                isLoading: countryLoading,
                error: countryError,
            },
            city: {
                value: formData.locationCity,
                error: errors.locationCity,
                onChange: setCity,
            },
        },
    };
};
