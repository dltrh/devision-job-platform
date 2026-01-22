import { useState, useCallback } from "react";
import type { PaymentMethodType } from "../types";

export type ViewMode = "overview" | "plans" | "payment";

export interface UseSubscriptionManagementProps {
    onPurchaseComplete?: () => void;
    onCancelComplete?: () => void;
}

export interface UseSubscriptionManagementReturn {
    // View state
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    goToOverview: () => void;
    goToPlans: () => void;
    goToPayment: () => void;
    goBack: () => void;

    // Plan selection
    selectedPlanId: string | null;
    selectPlan: (planId: string) => void;
    clearPlanSelection: () => void;

    // Payment method selection
    selectedPaymentMethod: PaymentMethodType | null;
    selectPaymentMethod: (method: PaymentMethodType) => void;
    clearPaymentMethod: () => void;

    // Actions
    handleUpgrade: () => void;
    handleRenew: () => void;
    handlePlanSelect: (planId: string) => void;
    handlePaymentMethodSelect: (method: PaymentMethodType) => void;
    handleBackToOverview: () => void;

    // Reset
    reset: () => void;
}

/**
 * Headless subscription management hook
 * Manages the state and logic for subscription flow without UI
 */
export const useSubscriptionManagement = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _props: UseSubscriptionManagementProps = {}
): UseSubscriptionManagementReturn => {
    const [viewMode, setViewMode] = useState<ViewMode>("overview");
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(
        null
    );

    const goToOverview = useCallback(() => {
        setViewMode("overview");
    }, []);

    const goToPlans = useCallback(() => {
        setViewMode("plans");
    }, []);

    const goToPayment = useCallback(() => {
        setViewMode("payment");
    }, []);

    const goBack = useCallback(() => {
        if (viewMode === "payment") {
            setViewMode("plans");
        } else if (viewMode === "plans") {
            setViewMode("overview");
        }
    }, [viewMode]);

    const selectPlan = useCallback((planId: string) => {
        setSelectedPlanId(planId);
    }, []);

    const clearPlanSelection = useCallback(() => {
        setSelectedPlanId(null);
    }, []);

    const selectPaymentMethod = useCallback((method: PaymentMethodType) => {
        setSelectedPaymentMethod(method);
    }, []);

    const clearPaymentMethod = useCallback(() => {
        setSelectedPaymentMethod(null);
    }, []);

    const handleUpgrade = useCallback(() => {
        setViewMode("plans");
    }, []);

    const handleRenew = useCallback(() => {
        setViewMode("plans"); // Corresponds to /subscription/upgrade route
    }, []);

    const handlePlanSelect = useCallback((planId: string) => {
        setSelectedPlanId(planId);
        setViewMode("payment");
    }, []);

    const handlePaymentMethodSelect = useCallback((method: PaymentMethodType) => {
        setSelectedPaymentMethod(method);
    }, []);

    const handleBackToOverview = useCallback(() => {
        setViewMode("overview");
        setSelectedPlanId(null);
        setSelectedPaymentMethod(null);
    }, []);

    const reset = useCallback(() => {
        setViewMode("overview");
        setSelectedPlanId(null);
        setSelectedPaymentMethod(null);
    }, []);

    return {
        // View state
        viewMode,
        setViewMode,
        goToOverview,
        goToPlans,
        goToPayment,
        goBack,

        // Plan selection
        selectedPlanId,
        selectPlan,
        clearPlanSelection,

        // Payment method selection
        selectedPaymentMethod,
        selectPaymentMethod,
        clearPaymentMethod,

        // Actions
        handleUpgrade,
        handleRenew,
        handlePlanSelect,
        handlePaymentMethodSelect,
        handleBackToOverview,

        // Reset
        reset,
    };
};
