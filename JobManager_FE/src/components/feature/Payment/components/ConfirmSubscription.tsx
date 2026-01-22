import React, { useState } from "react";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Badge } from "@/components/ui/Badge/Badge";
import {
    ArrowLeft,
    Crown,
    Calendar,
    Mail,
    CreditCard,
    AlertCircle,
    Check,
    RefreshCw,
} from "lucide-react";
import { PREMIUM_PLAN } from "../types";
import type { PremiumPlan, SubscriptionConfirmation } from "../types";

interface ConfirmSubscriptionProps {
    plan?: PremiumPlan;
    companyEmail: string;
    onConfirm: (confirmation: SubscriptionConfirmation) => void;
    onBack: () => void;
    isLoading?: boolean;
}

export const ConfirmSubscription: React.FC<ConfirmSubscriptionProps> = ({
    plan = PREMIUM_PLAN,
    companyEmail,
    onConfirm,
    onBack,
    isLoading = false,
}) => {
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const handleConfirm = () => {
        if (!agreedToTerms) return;

        onConfirm({
            planId: plan.id,
            planName: plan.name,
            price: plan.price,
            currency: plan.currency,
            billingCycle: "Monthly",
            companyEmail,
            agreedToTerms,
        });
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        }).format(price);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    onClick={onBack}
                >
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Confirm Your Subscription</h1>
                    <p className="text-sm text-gray-500">
                        Review your subscription details before proceeding
                    </p>
                </div>
            </div>

            {/* Subscription Summary Card */}
            <Card padding="lg" className="border-2 border-indigo-100">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-grow">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                            <Badge variant="neutral" className="bg-indigo-100 text-indigo-700">
                                Premium
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Full access to all premium features
                        </p>
                    </div>
                </div>

                {/* Summary Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <div className="flex items-center gap-2 text-gray-600">
                            <CreditCard className="w-4 h-4" />
                            <span>Price</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                            {formatPrice(plan.price, plan.currency)} / month
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Billing Cycle</span>
                        </div>
                        <span className="font-semibold text-gray-900">Monthly</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <div className="flex items-center gap-2 text-gray-600">
                            <RefreshCw className="w-4 h-4" />
                            <span>Auto-renewal</span>
                        </div>
                        <Badge variant="success">Enabled</Badge>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>Company Email</span>
                        </div>
                        <span className="font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded">
                            {companyEmail}
                        </span>
                    </div>
                </div>

                {/* Total */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total Due Today</span>
                        <span className="text-2xl font-bold text-indigo-600">
                            {formatPrice(plan.price, plan.currency)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        You will be charged {formatPrice(plan.price, plan.currency)} monthly until
                        you cancel
                    </p>
                </div>
            </Card>

            {/* Important Notice */}
            <Card padding="md" className="bg-amber-50 border-amber-200">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-amber-900 mb-1">Subscription Terms</h4>
                        <ul className="text-sm text-amber-800 space-y-1">
                            <li>• Your subscription will renew automatically every month</li>
                            <li>• You can cancel anytime from your profile settings</li>
                            <li>• No refunds for partial months upon cancellation</li>
                            <li>• You'll receive a reminder email 7 days before renewal</li>
                        </ul>
                    </div>
                </div>
            </Card>

            {/* Consent Checkbox */}
            <Card padding="md">
                <label className="flex items-start gap-3 cursor-pointer">
                    <div className="pt-0.5">
                        <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                    </div>
                    <div className="flex-1">
                        <span className="text-gray-900 font-medium">
                            I understand this is a recurring monthly subscription
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                            By checking this box, you agree to be charged{" "}
                            {formatPrice(plan.price, plan.currency)} monthly until you cancel. You
                            can manage or cancel your subscription at any time.
                        </p>
                    </div>
                </label>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="sm:w-auto"
                    disabled={isLoading}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                    Go Back
                </Button>
                <Button
                    variant="primary"
                    onClick={handleConfirm}
                    disabled={!agreedToTerms || isLoading}
                    isLoading={isLoading}
                    className="flex-1 sm:flex-none sm:min-w-[200px] bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    leftIcon={<Check className="w-4 h-4" />}
                >
                    Proceed to Payment
                </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-6 text-gray-400 text-xs pt-4">
                <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                    </svg>
                    <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <span>Cancel Anytime</span>
                </div>
                <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    <span>24/7 Support</span>
                </div>
            </div>
        </div>
    );
};
