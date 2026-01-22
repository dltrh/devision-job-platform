import { useState, useEffect } from "react";
import { getCompanyId, notifySubscriptionChange } from "@/services/authStorage";
import type {
    SubscriptionStatusResponse,
    SubscriptionPlan,
    CreatePaymentIntentRequest,
    PaymentIntentResponse,
    SubscriptionPurchaseRequest,
    SubscriptionHistory,
} from "../types";
import {
    getSubscriptionStatus,
    checkIsPremium,
    getSubscriptionPlans,
    createPaymentIntent,
    purchaseSubscription,
    getSubscriptionHistory,
    cancelSubscription,
    renewSubscription,
} from "../api/SubscriptionService";

/**
 * Hook for managing subscription status
 */
export const useSubscriptionStatus = () => {
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatusResponse | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getSubscriptionStatus();
            if (response.success) {
                setSubscriptionStatus(response.data);
            } else {
                setError(response.message);
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to fetch subscription status");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const refetch = () => {
        fetchStatus();
    };

    return {
        subscriptionStatus,
        isLoading,
        error,
        refetch,
    };
};

/**
 * Hook for checking premium status
 */
export const useIsPremium = () => {
    const [isPremium, setIsPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkPremium = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await checkIsPremium();
            if (response.success) {
                setIsPremium(response.data);
            } else {
                setError(response.message);
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to check premium status");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkPremium();
    }, []);

    return {
        isPremium,
        isLoading,
        error,
        refetch: checkPremium,
    };
};

/**
 * Hook for fetching available subscription plans
 */
export const useSubscriptionPlans = () => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPlans = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getSubscriptionPlans();
            if (response.success) {
                setPlans(response.data);
            } else {
                setError(response.message);
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to fetch subscription plans");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    return {
        plans,
        isLoading,
        error,
        refetch: fetchPlans,
    };
};

/**
 * Hook for managing subscription purchase flow
 */
export const useSubscriptionPurchase = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [paymentIntent, setPaymentIntent] = useState<PaymentIntentResponse | null>(null);

    const createIntent = async (request: CreatePaymentIntentRequest) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await createPaymentIntent(request);
            if (response.success) {
                setPaymentIntent(response.data);
                return response.data;
            } else {
                setError(response.message);
                return null;
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || "Failed to create payment intent";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const completePurchase = async (request: SubscriptionPurchaseRequest) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await purchaseSubscription(request);
            if (response.success) {
                setSuccess("Subscription purchased successfully!");
                return response.data;
            } else {
                setError(response.message);
                return null;
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || "Failed to complete purchase";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => setError(null);
    const clearSuccess = () => setSuccess(null);

    return {
        createIntent,
        completePurchase,
        paymentIntent,
        isLoading,
        error,
        success,
        clearError,
        clearSuccess,
    };
};

/**
 * Hook for fetching subscription history
 */
export const useSubscriptionHistory = () => {
    const [history, setHistory] = useState<SubscriptionHistory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getSubscriptionHistory();
            if (response.success) {
                setHistory(response.data);
            } else {
                setError(response.message);
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to fetch subscription history");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return {
        history,
        isLoading,
        error,
        refetch: fetchHistory,
    };
};

/**
 * Hook for canceling subscription
 */
export const useCancelSubscription = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const cancel = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await cancelSubscription();
            if (response.success) {
                setSuccess(
                    "Subscription cancelled successfully. It will remain active until the end date."
                );
                // Notify other components (e.g., AppHeader) about the subscription change
                notifySubscriptionChange();
                return response.data;
            } else {
                setError(response.message);
                return null;
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || "Failed to cancel subscription";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => setError(null);
    const clearSuccess = () => setSuccess(null);

    return {
        cancel,
        isLoading,
        error,
        success,
        clearError,
        clearSuccess,
    };
};

/**
 * Hook for renewing subscription
 */
export const useRenewSubscription = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const renew = async (planId: string) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await renewSubscription(planId);
            if (response.success) {
                setSuccess("Subscription renewed successfully!");
                return response.data;
            } else {
                setError(response.message);
                return null;
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || "Failed to renew subscription";
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => setError(null);
    const clearSuccess = () => setSuccess(null);

    return {
        renew,
        isLoading,
        error,
        success,
        clearError,
        clearSuccess,
    };
};
