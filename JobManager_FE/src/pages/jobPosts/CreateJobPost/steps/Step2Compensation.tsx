import React from "react";
import { Input, Select } from "@/components/ui";
import { JobPostFormData, JobPostFormErrors } from "../types";
import { useCompensationStep } from "../hooks";
import { SalaryType } from "@/types";

// ============================================================================
// Types
// ============================================================================

interface Step2CompensationProps {
    formData: JobPostFormData;
    errors: JobPostFormErrors;
    onChange: (field: keyof JobPostFormData, value: any) => void;
}

// ============================================================================
// Main Component
// ============================================================================

export const Step2Compensation: React.FC<Step2CompensationProps> = (props) => {
    // Use headless hook for all logic
    const { salaryType, salary, salaryNote, location } = useCompensationStep(props);

    // Render salary inputs based on config
    const renderSalaryInputs = () => {
        const { config, min, max } = salary;

        switch (config.type) {
            case "range":
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={config.minLabel}
                            type="number"
                            placeholder="50000"
                            value={min.value}
                            onChange={min.onChange}
                            error={min.error}
                            fullWidth
                        />
                        <Input
                            label={config.maxLabel}
                            type="number"
                            placeholder="80000"
                            value={max.value}
                            onChange={max.onChange}
                            error={max.error}
                            fullWidth
                        />
                    </div>
                );

            case "single-min":
                return (
                    <Input
                        label={config.minLabel}
                        type="number"
                        placeholder="60000"
                        value={min.value}
                        onChange={min.onChange}
                        error={min.error}
                        helperText={config.helperText}
                        fullWidth
                    />
                );

            case "single-max":
                return (
                    <Input
                        label={config.maxLabel}
                        type="number"
                        placeholder="100000"
                        value={max.value}
                        onChange={max.onChange}
                        error={max.error}
                        helperText={config.helperText}
                        fullWidth
                    />
                );

            case "negotiable":
                return (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            Salary will be discussed during the interview process.
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Salary Type Selector */}
            <Select
                label="Salary Type *"
                options={salaryType.options}
                value={salaryType.value}
                onChange={(e) => salaryType.onChange(e.target.value as SalaryType)}
                error={salaryType.error}
                fullWidth
            />

            {/* Dynamic Salary Inputs */}
            {renderSalaryInputs()}

            {/* Optional Salary Note */}
            {salaryType.value && (
                <div>
                    {!salaryNote.isVisible ? (
                        <button
                            type="button"
                            onClick={salaryNote.show}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            + Add salary note (optional)
                        </button>
                    ) : (
                        <Input
                            label="Salary Note (Optional)"
                            type="text"
                            placeholder="e.g., Plus performance bonuses, equity options"
                            value={salaryNote.value}
                            onChange={salaryNote.onChange}
                            helperText="Additional compensation details"
                            fullWidth
                        />
                    )}
                </div>
            )}

            {/* Location */}
            <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>

                <div className="space-y-4">
                    <Select
                        label="Country *"
                        options={location.country.options}
                        value={props.formData.countryCode}
                        onChange={(e) => props.onChange("countryCode", e.target.value)}
                        error={location.country.error || undefined}
                        disabled={location.country.isLoading}
                        fullWidth
                    />

                    <Input
                        label="City *"
                        type="text"
                        placeholder="e.g., Ho Chi Minh City"
                        value={location.city.value}
                        onChange={location.city.onChange}
                        error={location.city.error}
                        fullWidth
                    />

                    {location.country.isLoading && (
                        <p className="text-sm text-gray-500">Loading countries...</p>
                    )}
                </div>
            </div>
        </div>
    );
};
