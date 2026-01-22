import React from "react";
import { Input, Button } from "@/components/ui";
import { JobPostFormData, JobPostFormErrors } from "../types";
import { useVisibilityStep, VisibilityOption } from "../hooks";
import clsx from "clsx";

// ============================================================================
// Types
// ============================================================================

interface Step4VisibilityProps {
    formData: JobPostFormData;
    errors: JobPostFormErrors;
    onChange: (field: keyof JobPostFormData, value: any) => void;
    onSaveDraft: () => void;
    onPublish: () => void;
    isSaving: boolean;
    showPreview: () => void;
}

// ============================================================================
// Sub-Components (UI Layer)
// ============================================================================

interface VisibilityOptionCardProps {
    option: VisibilityOption;
    isSelected: boolean;
    onChange: () => void;
}

const VisibilityOptionCard: React.FC<VisibilityOptionCardProps> = ({
    option,
    isSelected,
    onChange,
}) => (
    <label
        className={clsx(
            "flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all",
            isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
        )}
    >
        <input
            type="radio"
            name="visibility"
            checked={isSelected}
            onChange={onChange}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex-1">
            <div className="flex items-center gap-2">
                <span
                    className={clsx("font-medium", isSelected ? "text-blue-700" : "text-gray-900")}
                >
                    {option.icon} {option.label}
                </span>
                {option.isRecommended && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Recommended
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{option.description}</p>
        </div>
    </label>
);

// ============================================================================
// Main Component
// ============================================================================

export const Step4Visibility: React.FC<Step4VisibilityProps> = (props) => {
    // Use headless hook for all logic
    const { visibility, expiry, summary, actions } = useVisibilityStep(props);

    return (
        <div className="space-y-6">
            {/* Visibility Toggle */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Visibility</label>
                <div className="space-y-3" role="radiogroup" aria-label="Visibility options">
                    {visibility.options.map((option) => {
                        const optionProps = visibility.getOptionProps(option);
                        return (
                            <VisibilityOptionCard
                                key={option.label}
                                option={option}
                                isSelected={optionProps.isSelected}
                                onChange={optionProps.onChange}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Expiry Date */}
            <div>
                <Input
                    label="Expiry Date (Optional)"
                    type="date"
                    value={expiry.value}
                    onChange={expiry.onChange}
                    error={expiry.error}
                    min={expiry.minDate}
                    helperText="Job post will automatically close after this date"
                    fullWidth
                />

                {!expiry.hasValue && (
                    <button
                        type="button"
                        onClick={expiry.setDefault}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Set default (30 days from now)
                    </button>
                )}
            </div>

            {/* Preview Summary */}
            <div className="border-t pt-6 mt-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        📋 Ready to Publish?
                    </h3>
                    <div className="space-y-2 text-sm">
                        {summary.items.map((item) => (
                            <div key={item.label} className="flex justify-between">
                                <span className="text-gray-600">{item.label}:</span>
                                <span className="font-medium text-gray-900">{item.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Preview Button */}
                    <button
                        type="button"
                        onClick={actions.preview}
                        className="mt-4 w-full py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                    >
                        👁️ Preview Job Post
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-6 mt-6">
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={actions.saveDraft}
                        disabled={!actions.canSave}
                        className="flex-1"
                        size="lg"
                    >
                        💾 Save as Draft
                    </Button>
                    <Button
                        variant="primary"
                        onClick={actions.publish}
                        isLoading={actions.isSaving}
                        className="flex-1"
                        size="lg"
                    >
                        🚀 Publish Job Post
                    </Button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-3">
                    You can always edit or unpublish this job post later
                </p>
            </div>
        </div>
    );
};
