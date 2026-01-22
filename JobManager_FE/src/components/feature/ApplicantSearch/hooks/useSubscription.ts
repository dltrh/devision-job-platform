import { useState, useCallback, useEffect } from "react";
import { SubscriptionService } from "@/components/feature/Subscription";
import type { SubscriptionStatusResponse } from "@/components/feature/Subscription";

interface UseSubscriptionReturn {
    isPremium: boolean;
    subscription: SubscriptionStatusResponse | null;
    isLoading: boolean;
    error: string | null;
    checkSubscription: () => Promise<void>;
}

export const useSubscription = (): UseSubscriptionReturn => {
    const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null);
    const [isPremium, setIsPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkSubscription = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await SubscriptionService.getSubscriptionStatus();
            if (response.success && response.data) {
                setSubscription(response.data);
                setIsPremium(response.data.isPremium);
            }
        } catch (err) {
            // If subscription check fails, assume not premium
            console.warn("Subscription check failed:", err);
            setIsPremium(false);
            setSubscription(null);
            // Don't show error - just disable premium features
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Check subscription on mount
    useEffect(() => {
        checkSubscription();
    }, [checkSubscription]);

    return {
        isPremium,
        subscription,
        isLoading,
        error,
        checkSubscription,
    };
};
