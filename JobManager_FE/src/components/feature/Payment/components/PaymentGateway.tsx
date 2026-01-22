import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { ArrowLeft, Shield, Lock, ExternalLink, AlertCircle } from "lucide-react";
import { stripePromise, stripeAppearance } from "../config/stripe";
import { StripeCheckoutForm } from "./StripeCheckoutForm";
import { logStripeDebugInfo, validateStripeKey } from "../utils/stripeDebug";
import type { PaymentGateway as PaymentGatewayType, SubscriptionConfirmation } from "../types";

interface PaymentGatewayProps {
    confirmation: SubscriptionConfirmation;
    gateway?: PaymentGatewayType;
    clientSecret?: string;
    paymentIntentId?: string;
    onPaymentComplete: (success: boolean, transactionId?: string) => void;
    onBack: () => void;
    onCancel: () => void;
    isProcessing?: boolean;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
    confirmation,
    gateway = "stripe",
    clientSecret,
    // paymentIntentId is passed for reference but Stripe handles it via clientSecret
    paymentIntentId: _paymentIntentId,
    onPaymentComplete,
    onBack,
    onCancel,
    isProcessing = false,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [stripeError, setStripeError] = useState<string | null>(null);

    useEffect(() => {
        // Log Stripe configuration for debugging
        if (import.meta.env.VITE_ENV === "development") {
            logStripeDebugInfo(clientSecret);
        }

        // Validate Stripe key
        const keyValidation = validateStripeKey();
        if (!keyValidation.valid) {
            setStripeError(keyValidation.error || "Stripe configuration error");
            setIsLoading(false);
            return;
        }

        // Short delay to show loading state, then show payment form
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [clientSecret]);

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        }).format(price);
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="max-w-xl mx-auto">
                <Card padding="lg" className="text-center">
                    <div className="py-12">
                        {/* Stripe Logo */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-indigo-600 rounded-lg p-4">
                                <svg
                                    className="w-16 h-8 text-white"
                                    viewBox="0 0 60 25"
                                    fill="currentColor"
                                >
                                    <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a10.3 10.3 0 01-4.56.95c-4.01 0-6.83-2.5-6.83-7.28 0-4.19 2.39-7.34 6.18-7.34 3.72 0 6.06 2.93 6.06 7.15 0 .6-.04 1.25-.04 1.6zm-6.08-5.86c-1.2 0-2.1.94-2.26 2.6h4.38c0-1.59-.78-2.6-2.12-2.6z" />
                                </svg>
                            </div>
                        </div>

                        {/* Loading Spinner */}
                        <div className="flex justify-center mb-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Loading secure payment form...
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Please wait while we connect to our payment provider
                        </p>

                        {/* Security Badge */}
                        <div className="flex items-center justify-center gap-2 mt-6 text-gray-400">
                            <Lock className="w-4 h-4" />
                            <span className="text-xs">256-bit SSL Encrypted</span>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // Check if we have a valid clientSecret
    if (!clientSecret) {
        return (
            <div className="max-w-xl mx-auto">
                <Card padding="lg" className="text-center">
                    <div className="py-8">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Payment Setup Failed
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Unable to initialize the payment form. The payment session may have
                            expired. Please go back and create a new payment.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={onBack}>
                                Go Back & Retry
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // Check if Stripe publishable key is configured
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        return (
            <div className="max-w-xl mx-auto">
                <Card padding="lg" className="text-center">
                    <div className="py-8">
                        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Configuration Required
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">
                            Stripe is not configured. Please add your Stripe publishable key.
                        </p>
                        <div className="bg-gray-100 rounded-lg p-4 text-left text-xs mb-6">
                            <p className="font-mono text-gray-700 mb-2">
                                Add to <code>.env.development</code>:
                            </p>
                            <code className="text-indigo-600">
                                VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
                            </code>
                        </div>
                        <Button variant="outline" onClick={onBack}>
                            Go Back
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // Stripe Elements options
    const elementsOptions = {
        clientSecret,
        appearance: stripeAppearance,
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    onClick={onBack}
                    disabled={isProcessing}
                >
                    Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Secure Payment</h1>
                    <p className="text-sm text-gray-500">
                        Complete your subscription via {gateway === "stripe" ? "Stripe" : "PayPal"}
                    </p>
                </div>
            </div>

            {/* Order Summary */}
            <Card padding="md" className="bg-gray-50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">You're paying for</p>
                        <p className="font-semibold text-gray-900">{confirmation.planName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                            {formatPrice(confirmation.price, confirmation.currency)}
                        </p>
                        <p className="text-xs text-gray-500">per month</p>
                    </div>
                </div>
            </Card>

            {/* Stripe Payment Form */}
            <Card padding="none" className="overflow-hidden border-2 border-gray-200">
                {/* Stripe Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 rounded p-1">
                                <svg
                                    className="w-6 h-3 text-white"
                                    viewBox="0 0 60 25"
                                    fill="currentColor"
                                >
                                    <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a10.3 10.3 0 01-4.56.95c-4.01 0-6.83-2.5-6.83-7.28 0-4.19 2.39-7.34 6.18-7.34 3.72 0 6.06 2.93 6.06 7.15 0 .6-.04 1.25-.04 1.6zm-6.08-5.86c-1.2 0-2.1.94-2.26 2.6h4.38c0-1.59-.78-2.6-2.12-2.6z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                                Powered by Stripe
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600">
                            <Shield className="w-4 h-4" />
                            <span className="text-xs font-medium">Secure</span>
                        </div>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="p-6 bg-white">
                    {stripeError ? (
                        <div className="text-center py-8">
                            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <p className="text-red-600 mb-4">{stripeError}</p>
                            <Button variant="primary" onClick={() => setStripeError(null)}>
                                Try Again
                            </Button>
                        </div>
                    ) : (
                        <Elements
                            stripe={stripePromise}
                            options={elementsOptions}
                            key={clientSecret} // Force remount when clientSecret changes
                        >
                            <StripeCheckoutForm
                                onPaymentComplete={onPaymentComplete}
                                amount={confirmation.price}
                                currency={confirmation.currency}
                                isProcessing={isProcessing}
                            />
                        </Elements>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Your payment info is encrypted</span>
                        <a
                            href="https://stripe.com/docs/security"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-indigo-600 hover:underline"
                        >
                            <ExternalLink className="w-3 h-3" />
                            Learn more
                        </a>
                    </div>
                </div>
            </Card>

            {/* Cancel Option */}
            <div className="text-center">
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    className="text-gray-500"
                    disabled={isProcessing}
                >
                    Cancel and return to pricing
                </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-8 text-gray-400 text-xs pt-4">
                <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>PCI Compliant</span>
                </div>
                <div className="flex items-center gap-1">
                    <Lock className="w-4 h-4" />
                    <span>SSL Secured</span>
                </div>
            </div>

            {/* Test Card Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-blue-800 mb-2">🧪 Test Mode</p>
                <p className="text-blue-700 mb-2">Use these test card numbers:</p>
                <ul className="text-blue-600 space-y-1 text-xs">
                    <li>
                        <code className="bg-blue-100 px-1 rounded">4242 4242 4242 4242</code> -
                        Successful payment
                    </li>
                    <li>
                        <code className="bg-blue-100 px-1 rounded">4000 0000 0000 9995</code> -
                        Declined payment
                    </li>
                    <li>Use any future date for expiry and any 3 digits for CVC</li>
                </ul>
            </div>
        </div>
    );
};
