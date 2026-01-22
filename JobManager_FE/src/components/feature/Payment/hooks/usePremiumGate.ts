import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import { checkIsPremium, getSubscriptionStatus } from "../api/PaymentApiService";

interface UsePremiumGateOptions {
    /**
     * Override the premium status (useful for testing or when status is already known)
     */
    isPremiumOverride?: boolean;
    /**
     * Skip fetching from API (use when you want to provide status manually)
     */
    skipFetch?: boolean;
}

interface SubscriptionInfo {
    isPremium: boolean;
    status: string | null;
    expiresAt: string | null;
    daysRemaining: number | null;
}

/**
 * Hook to gate features behind premium subscription
 * Fetches real subscription status from the API
 */
export const usePremiumGate = (options: UsePremiumGateOptions = {}) => {
    const navigate = useNavigate();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [blockedFeature, setBlockedFeature] = useState<string | null>(null);

    // Subscription state from API
    const [isLoading, setIsLoading] = useState(!options.skipFetch);
    const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
        isPremium: options.isPremiumOverride ?? false,
        status: null,
        expiresAt: null,
        daysRemaining: null,
    });

    // Fetch subscription status on mount
    useEffect(() => {
        if (options.skipFetch) {
            return;
        }

        const fetchSubscriptionStatus = async () => {
            setIsLoading(true);
            try {
                // Try to get detailed subscription first
                const statusResponse = await getSubscriptionStatus();

                if (statusResponse.success && statusResponse.data) {
                    const data = statusResponse.data;

                    // Calculate days remaining
                    let daysRemaining: number | null = null;
                    if (data.endAt) {
                        const endDate = new Date(data.endAt);
                        const now = new Date();
                        const diffTime = endDate.getTime() - now.getTime();
                        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    }

                    setSubscriptionInfo({
                        isPremium: data.isPremium,
                        status: data.status,
                        expiresAt: data.endAt,
                        daysRemaining,
                    });
                } else {
                    // Fallback to simple premium check
                    const premiumResponse = await checkIsPremium();
                    setSubscriptionInfo((prev) => ({
                        ...prev,
                        isPremium: premiumResponse.success ? premiumResponse.data : false,
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch subscription status:", error);
                // Keep default values on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubscriptionStatus();
    }, [options.skipFetch]);

    // Use override if provided, otherwise use fetched status
    const isPremium = options.isPremiumOverride ?? subscriptionInfo.isPremium;

    /**
     * Check if user has premium access
     * If not, show upgrade modal and return false
     */
    const requirePremium = useCallback(
        (featureName?: string): boolean => {
            if (isPremium) {
                return true;
            }

            setBlockedFeature(featureName || null);
            setShowUpgradeModal(true);
            return false;
        },
        [isPremium]
    );

    /**
     * Navigate directly to upgrade page
     */
    const goToUpgrade = useCallback(() => {
        navigate(`${ROUTES.SUBSCRIPTION}/upgrade`);
    }, [navigate]);

    /**
     * Navigate to subscription management
     */
    const goToSubscription = useCallback(() => {
        navigate(ROUTES.SUBSCRIPTION);
    }, [navigate]);

    /**
     * Close the upgrade modal
     */
    const closeUpgradeModal = useCallback(() => {
        setShowUpgradeModal(false);
        setBlockedFeature(null);
    }, []);

    /**
     * Execute action only if premium
     * If not premium, show upgrade modal
     */
    const withPremium = useCallback(
        <T extends (...args: any[]) => any>(
            action: T,
            featureName?: string
        ): ((...args: Parameters<T>) => ReturnType<T> | void) => {
            return (...args: Parameters<T>) => {
                if (requirePremium(featureName)) {
                    return action(...args);
                }
            };
        },
        [requirePremium]
    );

    return {
        isPremium,
        isLoading,
        subscriptionInfo,
        requirePremium,
        withPremium,
        goToUpgrade,
        goToSubscription,
        showUpgradeModal,
        closeUpgradeModal,
        blockedFeature,
    };
};

export default usePremiumGate;
