import React from "react";
import { JobPostFormData } from "../types";
import { EMPLOYMENT_TYPE_LABELS } from "@/utils/constants";

interface JobPostPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: JobPostFormData;
}

export const JobPostPreviewModal: React.FC<JobPostPreviewModalProps> = ({
    isOpen,
    onClose,
    formData,
}) => {
    if (!isOpen) return null;

    const formatSalary = () => {
        const type = formData.salaryType;
        if (!type) return "Not specified";

        switch (type) {
            case "RANGE":
                return `$${formData.salaryMin} - $${formData.salaryMax}`;
            case "ABOUT":
                return `~ $${formData.salaryMin}`;
            case "UP_TO":
                return `Up to $${formData.salaryMin}`;
            case "FROM":
                return `From $${formData.salaryMin}`;
            case "NEGOTIABLE":
                return "Negotiable";
            default:
                return "Not specified";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Preview Mode
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            This is how candidates will see your job post
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto">
                        {/* Job Header */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                {formData.title || "Untitled Job Post"}
                            </h1>

                            <div className="flex flex-wrap gap-3 mb-4">
                                {formData.employmentTypes.map((type) => (
                                    <span
                                        key={type}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                                    >
                                        {EMPLOYMENT_TYPE_LABELS[type]}
                                    </span>
                                ))}
                                {formData.isFresher && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                        Fresher Friendly
                                    </span>
                                )}
                                {formData.isPrivate && (
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                        🔒 Private
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <span>📍</span>
                                    <span>
                                        {formData.locationCity ||
                                            "Location TBD"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>💰</span>
                                    <span>{formatSalary()}</span>
                                </div>
                                {formData.expiryAt && (
                                    <div className="flex items-center gap-2">
                                        <span>📅</span>
                                        <span>
                                            Expires:{" "}
                                            {new Date(
                                                formData.expiryAt
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {formData.salaryNote && (
                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        💡 {formData.salaryNote}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Job Description */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">
                                About the Role
                            </h2>
                            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                                {formData.description ||
                                    "No description provided yet."}
                            </div>
                        </div>

                        {/* Technical Skills */}
                        {formData.technicalSkills.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                                    Required Skills
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {formData.technicalSkills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Call to Action */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Interested in this position?
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Click the button below to submit your
                                application
                            </p>
                            <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                                Apply Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Close Preview
                    </button>
                </div>
            </div>
        </div>
    );
};
