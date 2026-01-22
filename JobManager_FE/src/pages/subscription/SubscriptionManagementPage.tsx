import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card/Card";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog/ConfirmDialog";
import { useConfirmDialog } from "@/components/headless";
import { ArrowLeft } from "lucide-react";
import { SubscriptionStatusCard } from "@/components/feature/Subscription/components/SubscriptionStatusCard";
import { SubscriptionPlanCard } from "@/components/feature/Subscription/components/SubscriptionPlanCard";
import { SubscriptionHistoryTable } from "@/components/feature/Subscription/components/SubscriptionHistoryTable";
import { PaymentMethodSelector } from "@/components/feature/Subscription/components/PaymentMethodSelector";
import {
    useSubscriptionStatus,
    useSubscriptionPlans,
    useSubscriptionHistory,
    useSubscriptionPurchase,
    useCancelSubscription,
} from "@/components/feature/Subscription/hooks/useSubscription";
import { useSubscriptionManagement } from "@/components/feature/Subscription/hooks/useSubscriptionManagement";
import { getCompanyId } from "@/services/authStorage";

export const SubscriptionManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const companyId = getCompanyId();

    // Headless confirm dialog for cancel subscription
    const cancelConfirmDialog = useConfirmDialog();

    // Headless subscription management hook (pure logic, no UI)
    const {
        viewMode,
        selectedPlanId,
        selectedPaymentMethod,
        handleUpgrade,
        handlePlanSelect,
        handlePaymentMethodSelect,
        handleBackToOverview,
        goBack,
    } = useSubscriptionManagement();

    // Navigate to upgrade page for renew/upgrade
    const handleRenewClick = () => {
        navigate("/subscription/upgrade");
    };

    // Data hooks
    const {
        subscriptionStatus,
        isLoading: statusLoading,
        error: statusError,
        refetch: refetchStatus,
    } = useSubscriptionStatus();
    const { plans, isLoading: plansLoading, error: plansError } = useSubscriptionPlans();
    const {
        history,
        isLoading: historyLoading,
        error: historyError,
        refetch: refetchHistory,
    } = useSubscriptionHistory();
    const {
        createIntent,
        completePurchase,
        isLoading: purchaseLoading,
        error: purchaseError,
        success: purchaseSuccess,
        clearError,
        clearSuccess,
    } = useSubscriptionPurchase();
    const {
        cancel,
        isLoading: cancelLoading,
        error: cancelError,
        success: cancelSuccess,
        clearError: clearCancelError,
        clearSuccess: clearCancelSuccess,
    } = useCancelSubscription();

    // Handlers
    const handlePurchase = async () => {
        if (!selectedPlanId || !selectedPaymentMethod || !companyId) {
            return;
        }

        // Step 1: Create payment intent
        const paymentIntentData = await createIntent({
            companyId,
            planId: selectedPlanId,
            paymentMethodType: selectedPaymentMethod,
        });

        if (!paymentIntentData) {
            return;
        }

        // Step 2: In a real implementation, you would:
        // - For Stripe: Load Stripe.js and confirm the payment using clientSecret
        // - For PayPal: Redirect to PayPal checkout page
        // For now, we'll simulate a successful payment

        // Simulate payment confirmation (remove this in production)
        const paymentMethodId = `pm_${Date.now()}`; // Mock payment method ID

        // Step 3: Complete the purchase
        const result = await completePurchase({
            companyId,
            planId: selectedPlanId,
            paymentMethodId,
            paymentIntentId: paymentIntentData.paymentIntentId,
        });

        if (result) {
            // Refresh data
            await refetchStatus();
            await refetchHistory();

            // Reset state and go back to overview
            setTimeout(() => {
                handleBackToOverview();
                clearSuccess();
            }, 2000);
        }
    };

    const handleCancelSubscription = () => {
        cancelConfirmDialog.open({
            title: "Cancel Subscription",
            message:
                "Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.",
            variant: "warning",
            confirmText: "Cancel Subscription",
            cancelText: "Keep Subscription",
            onConfirm: async () => {
                const result = await cancel();

                if (result) {
                    await refetchStatus();
                    await refetchHistory();

                    setTimeout(() => {
                        clearCancelSuccess();
                    }, 3000);
                }
            },
        });
    };

    const selectedPlan = plans.find((p) => p.id === selectedPlanId);

    // Render different views
    const renderOverview = () => (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage your premium subscription and payment history.
                </p>
            </div>

            {/* Status Card */}
            {subscriptionStatus && (
                <SubscriptionStatusCard
                    status={subscriptionStatus}
                    onUpgrade={handleRenewClick}
                    onRenew={handleRenewClick}
                    onCancel={handleCancelSubscription}
                    isLoading={cancelLoading}
                />
            )}

            {/* Cancel Success Alert */}
            {cancelSuccess && (
                <Alert type="success" onClose={clearCancelSuccess}>
                    {cancelSuccess}
                </Alert>
            )}

            {/* Cancel Error Alert */}
            {cancelError && (
                <Alert type="error" onClose={clearCancelError}>
                    {cancelError}
                </Alert>
            )}

            {/* History Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
                <SubscriptionHistoryTable history={history} isLoading={historyLoading} />
                {historyError && <Alert type="error">{historyError}</Alert>}
            </div>
        </div>
    );

    const renderPlans = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    onClick={handleBackToOverview}
                >
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Choose Your Plan</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Select a subscription plan that fits your needs.
                    </p>
                </div>
            </div>

            {/* Plans Grid */}
            {plansLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-500">Loading plans...</p>
                </div>
            ) : plansError ? (
                <Alert type="error">{plansError}</Alert>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <SubscriptionPlanCard
                            key={plan.id}
                            plan={plan}
                            isPopular={plan.name === "Premium"}
                            isCurrentPlan={subscriptionStatus?.isPremium && plan.name === "Premium"}
                            onSelect={handleSelectPlan}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    const renderPayment = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    onClick={goBack}
                >
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Complete Your Purchase</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Choose your payment method and complete the transaction.
                    </p>
                </div>
            </div>

            {/* Purchase Success */}
            {purchaseSuccess && (
                <Alert type="success" onClose={clearSuccess}>
                    {purchaseSuccess}
                </Alert>
            )}

            {/* Purchase Error */}
            {purchaseError && (
                <Alert type="error" onClose={clearError}>
                    {purchaseError}
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Selected Plan Summary */}
                <div className="lg:col-span-2 space-y-6">
                    <Card padding="lg">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Selected Plan</h2>
                        {selectedPlan && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {selectedPlan.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {selectedPlan.billingPeriod === "MONTHLY"
                                                ? "Monthly"
                                                : "Yearly"}{" "}
                                            subscription
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {selectedPlan.currency === "USD"
                                                ? "$"
                                                : selectedPlan.currency}
                                            {selectedPlan.price}
                                        </span>
                                        <p className="text-xs text-gray-500">
                                            /
                                            {selectedPlan.billingPeriod === "MONTHLY"
                                                ? "month"
                                                : "year"}
                                        </p>
                                    </div>
                                </div>
                                <ul className="space-y-2">
                                    {selectedPlan.features.slice(0, 3).map((feature, index) => (
                                        <li
                                            key={index}
                                            className="text-sm text-gray-700 flex items-center gap-2"
                                        >
                                            <span className="text-green-500">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Card>

                    {/* Payment Method Selection */}
                    <Card padding="lg">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                        <PaymentMethodSelector
                            selectedMethod={selectedPaymentMethod}
                            onSelectMethod={handlePaymentMethodSelect}
                            disabled={purchaseLoading}
                        />
                    </Card>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card padding="lg" className="sticky top-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-900 font-medium">
                                    {selectedPlan &&
                                        `${selectedPlan.currency === "USD" ? "$" : selectedPlan.currency}${selectedPlan.price}`}
                                </span>
                            </div>
                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex justify-between">
                                    <span className="text-base font-semibold text-gray-900">
                                        Total
                                    </span>
                                    <span className="text-xl font-bold text-gray-900">
                                        {selectedPlan &&
                                            `${selectedPlan.currency === "USD" ? "$" : selectedPlan.currency}${selectedPlan.price}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={handlePurchase}
                            disabled={!selectedPaymentMethod || purchaseLoading}
                            isLoading={purchaseLoading}
                        >
                            Complete Purchase
                        </Button>
                        <p className="text-xs text-gray-500 mt-3 text-center">
                            Your subscription will renew automatically
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {viewMode === "overview" && renderOverview()}
                    {viewMode === "plans" && renderPlans()}
                    {viewMode === "payment" && renderPayment()}
                </div>
            </div>

            {/* Headless Confirm Dialog for Cancel Subscription */}
            <ConfirmDialog dialog={cancelConfirmDialog} />
        </>
    );
};

export default SubscriptionManagementPage;
