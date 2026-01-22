import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { Alert } from "@/components/ui/Alert/Alert";
import {
    PricingOverview,
    ConfirmSubscription,
    PaymentGateway,
    PaymentResult,
    SubscriptionManagement,
} from "../components";
import {
    PREMIUM_PLAN,
    type SubscriptionConfirmation,
    type PaymentResultData,
    type SubscriptionDetails,
} from "../types";
import { usePaymentFlow } from "../hooks/usePaymentFlow";
import { getStoredUser } from "@/services/authStorage";
import { ROUTES } from "@/utils/constants";

type FlowMode = "upgrade" | "manage";

export const PaymentFlowPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine mode based on URL
    const isUpgradeFlow = location.pathname.includes("/upgrade");

    // Use the payment flow hook for API integration
    const {
        step,
        subscription,
        confirmation,
        paymentResult,
        clientSecret,
        paymentIntentId,
        isLoadingSubscription,
        isCreatingPayment,
        isProcessingPayment,
        error,
        goToStep,
        initiatePayment,
        completePayment,
        cancelSubscription,
        resetFlow,
        clearError,
        refetchSubscription,
    } = usePaymentFlow();

    // Local UI state
    const [mode, setMode] = useState<FlowMode>(isUpgradeFlow ? "upgrade" : "manage");
    const [isCancelling, setIsCancelling] = useState(false);
    const [localConfirmation, setLocalConfirmation] = useState<SubscriptionConfirmation | null>(
        confirmation
    );
    const [localPaymentResult, setLocalPaymentResult] = useState<PaymentResultData | null>(
        paymentResult
    );

    const user = getStoredUser();
    const companyEmail = user?.email || "company@example.com";

    // Derive subscription details from API response
    const subscriptionStatus: SubscriptionDetails = subscription || {
        id: "",
        companyId: user?.companyId || "",
        status: "INACTIVE",
        isPremium: false,
        currentPlan: "Free",
        startDate: null,
        endDate: null,
        nextBillingDate: null,
        autoRenew: true,
        daysRemaining: null,
        isExpiringSoon: false,
    };

    // Update local state when hook state changes
    useEffect(() => {
        if (paymentResult) {
            setLocalPaymentResult(paymentResult);
        }
    }, [paymentResult]);

    useEffect(() => {
        if (confirmation) {
            setLocalConfirmation(confirmation);
        }
    }, [confirmation]);

    // Update mode when URL changes
    useEffect(() => {
        if (isUpgradeFlow) {
            setMode("upgrade");
            if (step === "pricing") {
                // Keep pricing step
            }
        } else {
            setMode("manage");
        }
    }, [isUpgradeFlow, step]);

    // Handlers
    const handleUpgradeClick = useCallback(() => {
        goToStep("confirm");
    }, [goToStep]);

    const handleConfirm = useCallback(
        async (confirmationData: SubscriptionConfirmation) => {
            setLocalConfirmation(confirmationData);
            // Create payment intent and move to gateway
            const success = await initiatePayment(confirmationData);
            if (!success) {
                // Error is handled by the hook
                console.error("Failed to create payment intent");
            }
        },
        [initiatePayment]
    );

    const handlePaymentComplete = useCallback(
        async (success: boolean, transactionId?: string) => {
            await completePayment(success, transactionId);
        },
        [completePayment]
    );

    const handleGoToDashboard = useCallback(async () => {
        // Ensure subscription status is refreshed before navigating
        await refetchSubscription();
        // Small delay to allow state to propagate
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Set flag to show success message on dashboard
        sessionStorage.setItem("justUpgraded", "true");
        navigate(ROUTES.DASHBOARD);
    }, [navigate, refetchSubscription]);

    const handleTryAgain = useCallback(() => {
        setLocalPaymentResult(null);
        goToStep("gateway");
    }, [goToStep]);

    const handleContactSupport = useCallback(() => {
        window.open("mailto:support@jobmanager.com", "_blank");
    }, []);

    const handleBack = useCallback(() => {
        switch (step) {
            case "confirm":
                goToStep("pricing");
                break;
            case "gateway":
                goToStep("confirm");
                break;
            case "result":
                if (localPaymentResult?.status === "success") {
                    navigate(ROUTES.SUBSCRIPTION);
                } else {
                    goToStep("pricing");
                }
                break;
            default:
                navigate(-1);
        }
    }, [step, localPaymentResult, goToStep, navigate]);

    const handleCancelPayment = useCallback(() => {
        resetFlow();
        setLocalConfirmation(null);
    }, [resetFlow]);

    const handleRenew = useCallback(() => {
        setMode("upgrade");
        goToStep("pricing");
    }, [goToStep]);

    const handleCancel = useCallback(async () => {
        setIsCancelling(true);
        try {
            const success = await cancelSubscription();
            if (success) {
                await refetchSubscription();
            }
        } finally {
            setIsCancelling(false);
        }
    }, [cancelSubscription, refetchSubscription]);

    const handleManageUpgrade = useCallback(() => {
        setMode("upgrade");
        goToStep("pricing");
    }, [goToStep]);

    // Loading state
    const isLoading = isLoadingSubscription || isCreatingPayment || isProcessingPayment;

    // Render based on mode
    if (mode === "manage") {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<ArrowLeft className="w-4 h-4" />}
                            onClick={() => navigate(-1)}
                            className="mb-4"
                        >
                            Back
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Subscription Management
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Manage your subscription and billing settings
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert type="error" title="Error" className="mb-6" onClose={clearError}>
                            {error}
                        </Alert>
                    )}

                    {/* Loading State */}
                    {isLoadingSubscription ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                            <span className="ml-2 text-gray-500">
                                Loading subscription details...
                            </span>
                        </div>
                    ) : (
                        <SubscriptionManagement
                            subscription={subscriptionStatus}
                            onRenew={handleRenew}
                            onCancel={handleCancel}
                            onUpgrade={handleManageUpgrade}
                            isLoading={isLoading}
                            isCancelling={isCancelling}
                        />
                    )}
                </div>
            </div>
        );
    }

    // Upgrade flow
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Alert */}
                {error && (
                    <Alert type="error" title="Error" className="mb-6" onClose={clearError}>
                        {error}
                    </Alert>
                )}

                {/* Progress Indicator */}
                {step !== "result" && (
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-2">
                            {["pricing", "confirm", "gateway"].map((s, index) => (
                                <React.Fragment key={s}>
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                            step === s
                                                ? "bg-indigo-600 text-white"
                                                : ["pricing", "confirm", "gateway"].indexOf(step) >
                                                    index
                                                  ? "bg-green-500 text-white"
                                                  : "bg-gray-200 text-gray-500"
                                        }`}
                                    >
                                        {index + 1}
                                    </div>
                                    {index < 2 && (
                                        <div
                                            className={`w-16 h-1 rounded ${
                                                ["pricing", "confirm", "gateway"].indexOf(step) >
                                                index
                                                    ? "bg-green-500"
                                                    : "bg-gray-200"
                                            }`}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="flex justify-center mt-2">
                            <div className="flex gap-16 text-xs text-gray-500">
                                <span
                                    className={
                                        step === "pricing" ? "text-indigo-600 font-medium" : ""
                                    }
                                >
                                    Choose Plan
                                </span>
                                <span
                                    className={
                                        step === "confirm" ? "text-indigo-600 font-medium" : ""
                                    }
                                >
                                    Confirm
                                </span>
                                <span
                                    className={
                                        step === "gateway" ? "text-indigo-600 font-medium" : ""
                                    }
                                >
                                    Payment
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step Content */}
                {step === "pricing" && (
                    <PricingOverview
                        currentPlan={subscriptionStatus.isPremium ? "premium" : "free"}
                        onUpgrade={handleUpgradeClick}
                        isLoading={isLoading}
                    />
                )}

                {step === "confirm" && (
                    <ConfirmSubscription
                        plan={PREMIUM_PLAN}
                        companyEmail={companyEmail}
                        onConfirm={handleConfirm}
                        onBack={handleBack}
                        isLoading={isCreatingPayment}
                    />
                )}

                {step === "gateway" && localConfirmation && (
                    <PaymentGateway
                        confirmation={localConfirmation}
                        gateway="stripe"
                        clientSecret={clientSecret || undefined}
                        paymentIntentId={paymentIntentId || undefined}
                        onPaymentComplete={handlePaymentComplete}
                        onBack={handleBack}
                        onCancel={handleCancelPayment}
                        isProcessing={isProcessingPayment}
                    />
                )}

                {step === "result" && localPaymentResult && (
                    <>
                        <PaymentResult
                            result={localPaymentResult}
                            onGoToDashboard={handleGoToDashboard}
                            onTryAgain={handleTryAgain}
                            onContactSupport={handleContactSupport}
                        />

                        {/* Processing Overlay - shown while subscription is being activated */}
                        {isProcessingPayment && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                                <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
                                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Activating Your Subscription
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Please wait while we set up your premium account...
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentFlowPage;
