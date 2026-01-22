import React from "react";
import { checkPasswordRequirements } from "@/utils/passwordValidation";

interface PasswordRequirementsProps {
    password: string;
    className?: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
    password,
    className = "",
}) => {
    const requirements = checkPasswordRequirements(password);

    return (
        <div className={`space-y-2 ${className}`}>
            <p className="text-xs font-medium text-gray-700">
                Password must contain:
            </p>
            <ul className="space-y-1">
                {requirements.map((req, index) => (
                    <li key={index} className="flex items-center gap-2 text-xs">
                        {req.met ? (
                            <svg
                                className="h-4 w-4 flex-shrink-0 text-green-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg
                                className="h-4 w-4 flex-shrink-0 text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                        <span
                            className={
                                req.met
                                    ? "text-green-700 font-medium"
                                    : "text-gray-600"
                            }
                        >
                            {req.label}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
