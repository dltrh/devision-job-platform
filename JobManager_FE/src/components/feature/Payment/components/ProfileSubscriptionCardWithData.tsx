import React from "react";
import { ProfileSubscriptionCard as BaseCard } from "./UpgradePrompts";
import { useSubscriptionDetails } from "../hooks/usePaymentFlow";

/**
 * ProfileSubscriptionCard with real API data
 * Fetches subscription status from the backend
 */
interface ProfileSubscriptionCardWithDataProps {
    className?: string;
}

export const ProfileSubscriptionCardWithData: React.FC<ProfileSubscriptionCardWithDataProps> = ({
    className = "",
}) => {
    const { subscription, isLoading, error } = useSubscriptionDetails();

    if (isLoading) {
        return <div className={`animate-pulse bg-gray-100 rounded-lg h-48 ${className}`} />;
    }

    if (error) {
        return <BaseCard isPremium={false} status="INACTIVE" className={className} />;
    }

    return (
        <BaseCard
            isPremium={subscription?.isPremium || false}
            status={subscription?.status || "INACTIVE"}
            daysRemaining={subscription?.daysRemaining}
            endDate={subscription?.endDate}
            className={className}
        />
    );
};

export default ProfileSubscriptionCardWithData;
