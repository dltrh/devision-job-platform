import React from "react";
import clsx from "clsx";

interface PremiumUpgradeCardProps {
    title?: string;
    description?: string;
    buttonLabel?: string;
    onUpgradeClick?: () => void;
    className?: string;
}

export const PremiumUpgradeCard: React.FC<PremiumUpgradeCardProps> = ({
    title = "Unlock Real-Time Talent Alerts",
    description = "Upgrade to Premium to receive instant notifications when matching candidates apply to your job posts.",
    buttonLabel = "Upgrade to Premium",
    onUpgradeClick,
    className,
}) => {
    return (
        <div
            className={clsx(
                "relative overflow-hidden rounded-xl p-5",
                "bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700",
                "shadow-lg",
                className
            )}
        >
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
                {/* Icon */}
                <div className="w-12 h-12 mb-3 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                    </svg>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/80 mb-4">{description}</p>

                <button
                    type="button"
                    onClick={onUpgradeClick}
                    className={clsx(
                        "w-full py-2.5 px-4 rounded-lg",
                        "bg-white text-purple-700 font-medium text-sm",
                        "hover:bg-white/90 transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-white/50"
                    )}
                >
                    {buttonLabel}
                </button>

                <p className="mt-3 text-xs text-white/60 text-center">
                    Premium members get 5x more applicant matches
                </p>
            </div>
        </div>
    );
};
