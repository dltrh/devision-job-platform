import { useState, useEffect, useCallback } from "react";
import {
    getDetailedSubscription,
    checkIsPremium,
    createPaymentIntent,
    getPaymentHistory,
    cancelSubscription,
    getPaymentStatus,
} from "../api/PaymentApiService";
import { notifySubscriptionChange } from "@/services/authStorage";
import type {
    SubscriptionDetails,
    PaymentStep,
    SubscriptionConfirmation,
    PaymentResultData,
} from "../types";
import type { SubscriptionHistory } from "@/components/feature/Subscription/types";

/**
 * Hook for managing subscription status from the backend
 */
export const useSubscriptionDetails = () => {
    const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscription = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getDetailedSubscription();
            if (response.success) {
                setSubscription(response.data);
            } else {
                setError(response.message);
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to fetch subscription");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    return {
        subscription,
        isLoading,
        error,
        refetch: fetchSubscription,
    };
};

/**
 * Hook for checking premium status
 */
export const usePremiumStatus = () => {
    const [isPremium, setIsPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPremiumStatus = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchPremiumStatus();
    }, [fetchPremiumStatus]);

    return {
        isPremium,
        isLoading,
        error,
        refetch: fetchPremiumStatus,
    };
};

/**
 * Hook for fetching payment/subscription history
 */
export const usePaymentHistory = () => {
    const [history, setHistory] = useState<SubscriptionHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getPaymentHistory();
            if (response.success) {
                setHistory(response.data);
            } else {
                setError(response.message);
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to fetch payment history");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        history,
        isLoading,
        error,
        refetch: fetchHistory,
    };
};

/**
 * Main hook for managing the entire payment flow
 */
export const usePaymentFlow = () => {
    // Flow state
    const [step, setStep] = useState<PaymentStep>("pricing");
    const [confirmation, setConfirmation] = useState<SubscriptionConfirmation | null>(null);
    const [paymentResult, setPaymentResult] = useState<PaymentResultData | null>(null);

    // Payment intent state
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentId, setPaymentId] = useState<string | null>(null);

    // Loading and error states
    const [isCreatingPayment, setIsCreatingPayment] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Subscription status
    const {
        subscription,
        isLoading: isLoadingSubscription,
        refetch: refetchSubscription,
    } = useSubscriptionDetails();

    /**
     * Create a payment intent and move to gateway step
     */
    const initiatePayment = useCallback(
        async (confirmationData: SubscriptionConfirmation): Promise<boolean> => {
            setIsCreatingPayment(true);
            setError(null);
            setConfirmation(confirmationData);

            try {
                const response = await createPaymentIntent(
                    confirmationData.price,
                    confirmationData.currency,
                    `Premium Subscription for ${confirmationData.companyEmail}`
                );

                if (response.success && response.data) {
                    setPaymentIntentId(response.data.paymentIntentId || null);
                    setClientSecret(response.data.clientSecret);
                    // Store paymentIntentId as paymentId as well for tracking
                    setPaymentId(response.data.paymentIntentId || null);
                    setStep("gateway");
                    return true;
                } else {
                    setError(response.message || "Failed to create payment");
                    return false;
                }
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message ||
                    err.message ||
                    "Failed to create payment intent";
                setError(errorMessage);
                return false;
            } finally {
                setIsCreatingPayment(false);
            }
        },
        []
    );

    /**
     * Wait for subscription to be activated after payment
     * Polls the backend until premium status is confirmed
     */
    const waitForSubscriptionActivation = useCallback(
        async (maxAttempts: number = 10, intervalMs: number = 2000): Promise<boolean> => {
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                try {
                    const response = await getDetailedSubscription();

                    if (response.success && response.data?.isPremium) {
                        // Subscription is now active!
                        return true;
                    }

                    // Wait before next poll (except on last attempt)
                    if (attempt < maxAttempts - 1) {
                        await new Promise((resolve) => setTimeout(resolve, intervalMs));
                    }
                } catch (err) {
                    console.error(`Attempt ${attempt + 1} failed:`, err);
                    // Continue polling even if one attempt fails
                    if (attempt < maxAttempts - 1) {
                        await new Promise((resolve) => setTimeout(resolve, intervalMs));
                    }
                }
            }

            // Timeout - subscription not activated in time
            return false;
        },
        []
    );

    /**
     * Complete the payment process after Stripe confirmation
     */
    const completePayment = useCallback(
        async (success: boolean, transactionId?: string): Promise<void> => {
            setIsProcessingPayment(true);
            setError(null);

            try {
                if (success) {
                    // Note: Subscription creation/renewal is handled automatically via Kafka
                    // when the payment service publishes the payment.completed event.
                    // The subscription service's PaymentEventConsumer will either:
                    // - Create a new subscription if none exists, or
                    // - Renew (extend) an existing subscription

                    // Wait for subscription to be activated in the backend
                    const isActivated = await waitForSubscriptionActivation(10, 2000);

                    const today = new Date();
                    const nextMonth = new Date(today);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);

                    setPaymentResult({
                        status: "success",
                        transactionId: transactionId || paymentIntentId || undefined,
                        subscriptionStartDate: today.toISOString(),
                        nextBillingDate: nextMonth.toISOString(),
                    });

                    // Refresh subscription status one final time
                    await refetchSubscription();

                    // Notify other components (e.g., AppHeader) that subscription status changed
                    notifySubscriptionChange();

                    if (!isActivated) {
                        console.warn(
                            "Subscription activation timed out, but will show success screen"
                        );
                    }
                } else {
                    setPaymentResult({
                        status: "failure",
                        errorMessage:
                            "Your payment could not be processed. Please check your payment details and try again.",
                        errorCode: "PAYMENT_FAILED",
                    });
                }

                setStep("result");
            } catch (err: any) {
                const errorMessage =
                    err?.response?.data?.message || err.message || "Failed to process payment";
                setPaymentResult({
                    status: "failure",
                    errorMessage,
                    errorCode: "PROCESSING_ERROR",
                });
                setStep("result");
            } finally {
                setIsProcessingPayment(false);
            }
        },
        [paymentIntentId, refetchSubscription, waitForSubscriptionActivation]
    );

    /**
     * Poll payment status (for async payment confirmation)
     */
    const pollPaymentStatus = useCallback(
        async (
            paymentIdToPoll: string,
            maxAttempts: number = 10,
            intervalMs: number = 2000
        ): Promise<string> => {
            let attempts = 0;

            while (attempts < maxAttempts) {
                try {
                    const response = await getPaymentStatus(paymentIdToPoll);
                    const status = response.data?.status;

                    if (status === "SUCCEEDED" || status === "COMPLETED") {
                        return "success";
                    } else if (status === "FAILED" || status === "CANCELLED") {
                        return "failed";
                    }

                    // Wait before next poll
                    await new Promise((resolve) => setTimeout(resolve, intervalMs));
                    attempts++;
                } catch (err) {
                    attempts++;
                }
            }

            return "pending";
        },
        []
    );

    /**
     * Cancel subscription
     */
    const cancelCurrentSubscription = useCallback(async (): Promise<boolean> => {
        if (!subscription?.id) {
            setError("No subscription to cancel");
            return false;
        }

        try {
            await cancelSubscription(subscription.id);
            await refetchSubscription();
            // Notify other components (e.g., AppHeader) that subscription status changed
            notifySubscriptionChange();
            return true;
        } catch (err: any) {
            const errorMessage =
                err?.response?.data?.message || err.message || "Failed to cancel subscription";
            setError(errorMessage);
            return false;
        }
    }, [subscription?.id, refetchSubscription]);

    /**
     * Reset the payment flow
     */
    const resetFlow = useCallback(() => {
        setStep("pricing");
        setConfirmation(null);
        setPaymentResult(null);
        setPaymentIntentId(null);
        setClientSecret(null);
        setPaymentId(null);
        setError(null);
    }, []);

    /**
     * Go to a specific step
     */
    const goToStep = useCallback((newStep: PaymentStep) => {
        setStep(newStep);
        // Clear payment intent when going back to pricing or confirmation
        if (newStep === "pricing" || newStep === "confirm") {
            setPaymentIntentId(null);
            setClientSecret(null);
            setPaymentId(null);
        }
    }, []);

    /**
     * Clear error
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // Current state
        step,
        subscription,
        confirmation,
        paymentResult,
        clientSecret,
        paymentIntentId,
        paymentId,

        // Loading states
        isLoadingSubscription,
        isCreatingPayment,
        isProcessingPayment,
        isLoading: isLoadingSubscription || isCreatingPayment || isProcessingPayment,

        // Error state
        error,

        // Actions
        goToStep,
        initiatePayment,
        completePayment,
        pollPaymentStatus,
        cancelSubscription: cancelCurrentSubscription,
        resetFlow,
        clearError,
        refetchSubscription,
    };
};

export default usePaymentFlow;
