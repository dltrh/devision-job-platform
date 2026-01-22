import React from "react";
import { Card } from "../../ui/Card/Card";
import { Button } from "../../ui/Button/Button"; // Assuming Button exists

interface PremiumBannerProps {
    status: "FREE" | "PREMIUM" | "EXPIRING" | "EXPIRED";
    daysRemaining?: number;
    onUpgrade: () => void;
}

export const PremiumBanner: React.FC<PremiumBannerProps> = ({
    status,
    daysRemaining,
    onUpgrade,
}) => {
    // Don't show banner for FREE or healthy PREMIUM users
    if (status === "FREE") {
        return null;
    }

    if (status === "PREMIUM" && (daysRemaining === undefined || daysRemaining > 7)) {
        return null;
    }

    const config = {
        FREE: {
            title: "",
            message: "",
            buttonText: "",
            bg: "",
            textColor: "",
        },
        EXPIRING: {
            title: `Subscription Expiring in ${daysRemaining} ${daysRemaining === 1 ? "Day" : "Days"}`,
            message: "Renew now to keep your premium benefits active.",
            buttonText: "Renew Subscription",
            bg: "bg-amber-50 border-l-4 border-amber-500",
            textColor: "text-gray-700",
        },
        EXPIRED: {
            title: "Subscription Expired",
            message: "Your premium features are currently disabled. Reactivate to restore access.",
            buttonText: "Reactivate Now",
            bg: "bg-gray-50 border-l-4 border-gray-400",
            textColor: "text-gray-700",
        },
        PREMIUM: {
            // Fallback
            title: "",
            message: "",
            buttonText: "",
            bg: "",
            textColor: "",
        },
    };

    const currentConfig = config[status];

    return (
        <div className={`p-4 rounded-md ${currentConfig.bg} mb-6`}>
            <div className="flex justify-between items-center">
                <div className="flex">
                    <div className="ml-3">
                        <h3 className={`text-sm font-medium ${currentConfig.textColor}`}>
                            {currentConfig.title}
                        </h3>
                        <div className={`mt-2 text-sm ${currentConfig.textColor} opacity-90`}>
                            <p>{currentConfig.message}</p>
                        </div>
                    </div>
                </div>
                <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                        <button
                            onClick={onUpgrade}
                            className={`px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                status === "EXPIRING"
                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200 focus:ring-amber-500"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500"
                            }`}
                        >
                            {currentConfig.buttonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
