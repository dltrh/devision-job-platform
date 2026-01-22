import React from "react";
import { Input } from "@/components/ui";
import { JobPostFormData, JobPostFormErrors } from "../types";
import { useBasicsStep, EmploymentTypeOption } from "../hooks";
import clsx from "clsx";

// ============================================================================
// Types
// ============================================================================

interface Step1BasicsProps {
    formData: JobPostFormData;
    errors: JobPostFormErrors;
    onChange: (field: keyof JobPostFormData, value: any) => void;
}

// ============================================================================
// Sub-Components (UI Layer)
// ============================================================================

interface EmploymentTypeCardProps {
    option: EmploymentTypeOption;
    onToggle: () => void;
}

const EmploymentTypeCard: React.FC<EmploymentTypeCardProps> = ({ option, onToggle }) => (
    <label
        className={clsx(
            "flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all",
            option.isSelected
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300",
            option.isDisabled && "opacity-50 cursor-not-allowed"
        )}
    >
        <input
            type="checkbox"
            checked={option.isSelected}
            onChange={onToggle}
            disabled={option.isDisabled}
            className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex-1">
            <span
                className={clsx(
                    "font-medium",
                    option.isSelected ? "text-blue-700" : "text-gray-900"
                )}
            >
                {option.label}
            </span>
            {option.disabledReason && (
                <p className="text-xs text-gray-500 mt-1">{option.disabledReason}</p>
            )}
            {option.canCombine && !option.isDisabled && (
                <p className="text-xs text-gray-500 mt-1">Can only be combined with each other</p>
            )}
        </div>
    </label>
);

// ============================================================================
// Main Component
// ============================================================================

export const Step1Basics: React.FC<Step1BasicsProps> = (props) => {
    // Use headless hook for all logic
    const { title, employmentTypes, fresher } = useBasicsStep(props);

    return (
        <div className="space-y-6">
            {/* Job Title */}
            <Input
                label="Job Title *"
                type="text"
                placeholder="e.g., Senior Full-Stack Developer"
                value={title.value}
                onChange={title.onChange}
                error={title.error}
                fullWidth
            />

            {/* Employment Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Employment Type *
                </label>
                <div className="space-y-3" role="group" aria-label="Employment types">
                    {employmentTypes.options.map((option) => {
                        const optionProps = employmentTypes.getOptionProps(option);
                        return (
                            <EmploymentTypeCard
                                key={option.type}
                                option={option}
                                onToggle={optionProps.onChange}
                            />
                        );
                    })}
                </div>
                {employmentTypes.error && (
                    <p className="mt-2 text-sm text-red-600">{employmentTypes.error}</p>
                )}
            </div>

            {/* Fresher Friendly */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                    type="checkbox"
                    id="isFresher"
                    checked={fresher.isChecked}
                    onChange={(e) => fresher.onChange(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="isFresher" className="flex-1 cursor-pointer">
                    <span className="font-medium text-gray-900">Fresher Friendly</span>
                    <p className="text-sm text-gray-600 mt-1">
                        This position is suitable for candidates with little to no work experience
                    </p>
                </label>
            </div>
        </div>
    );
};
