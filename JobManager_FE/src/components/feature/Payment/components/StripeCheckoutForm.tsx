import React, { useState, useEffect, useRef } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/Button/Button";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { getStripeErrorMessage } from "../utils/stripeDebug";

interface StripeCheckoutFormProps {
    onPaymentComplete: (success: boolean, transactionId?: string) => void;
    amount: number;
    currency: string;
    isProcessing?: boolean;
}

export const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
    onPaymentComplete,
    amount,
    currency,
    isProcessing = false,
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [elementLoadError, setElementLoadError] = useState<string | null>(null);

    // Track if component is mounted to prevent state updates after unmount
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Listen for Payment Element ready and load errors
    useEffect(() => {
        if (!elements) return;

        // Get the payment element - may not exist immediately
        const paymentElement = elements.getElement("payment");
        if (!paymentElement) {
            // Element not mounted yet, will be handled when it's ready
            return;
        }

        // Handle loader errors (401, expired payment intent, etc.)
        const handleLoadError = (event: any) => {
            console.error("Payment Element load error:", event.error);
            if (!isMountedRef.current) return;
            const error = event.error;
            const friendlyMessage = getStripeErrorMessage(error);
            setElementLoadError(friendlyMessage);
        };

        // Handle when element is ready
        const handleReady = () => {
            console.log("Payment Element ready");
        };

        paymentElement.on("loaderror", handleLoadError);
        paymentElement.on("ready", handleReady);

        return () => {
            paymentElement.off("loaderror", handleLoadError);
            paymentElement.off("ready", handleReady);
        };
    }, [elements]);

    const formatPrice = (price: number, curr: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: curr,
        }).format(price);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js hasn't yet loaded.
            setErrorMessage("Payment system is still loading. Please wait a moment and try again.");
            return;
        }

        // Check if the payment element is ready
        const paymentElement = elements.getElement("payment");
        if (!paymentElement) {
            setErrorMessage("Payment form is not ready. Please wait or refresh the page.");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            // First, validate the form before submitting
            const { error: submitError } = await elements.submit();
            if (submitError) {
                console.error("Form validation error:", submitError);
                const friendlyMessage = getStripeErrorMessage(submitError);
                setErrorMessage(friendlyMessage);
                setIsSubmitting(false);
                return;
            }

            // Confirm the payment with Stripe
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    // Return URL after payment (for redirect-based payment methods)
                    return_url: `${window.location.origin}/subscription/payment-complete`,
                },
                redirect: "if_required", // Only redirect if necessary (e.g., 3D Secure)
            });

            if (!isMountedRef.current) return;

            if (error) {
                // Payment failed
                console.error("Payment error:", error);
                const friendlyMessage = getStripeErrorMessage(error);
                setErrorMessage(friendlyMessage);
                onPaymentComplete(false);
            } else if (paymentIntent) {
                // Payment succeeded or is processing
                console.log("Payment intent status:", paymentIntent.status);

                if (paymentIntent.status === "succeeded") {
                    // Payment completed successfully
                    onPaymentComplete(true, paymentIntent.id);
                } else if (paymentIntent.status === "processing") {
                    // Payment is being processed (e.g., bank transfer)
                    // Show processing message, webhook will confirm later
                    onPaymentComplete(true, paymentIntent.id);
                } else if (paymentIntent.status === "requires_action") {
                    // Additional authentication required (handled by redirect)
                    setErrorMessage(
                        "Additional authentication required. Please complete the verification."
                    );
                } else {
                    // Other status - treat as pending
                    setErrorMessage(
                        `Payment status: ${paymentIntent.status}. Please wait or try again.`
                    );
                }
            }
        } catch (err: any) {
            console.error("Payment submission error:", err);
            if (!isMountedRef.current) return;

            // Handle the specific "Element not mounted" error
            if (err.message?.includes("Element") && err.message?.includes("mounted")) {
                setErrorMessage(
                    "The payment form was interrupted. Please refresh the page and try again."
                );
            } else {
                setErrorMessage(err.message || "An unexpected error occurred.");
            }
            onPaymentComplete(false);
        } finally {
            if (isMountedRef.current) {
                setIsSubmitting(false);
            }
        }
    };

    const isDisabled = !stripe || !elements || isSubmitting || isProcessing || !!elementLoadError;

    // If there's an element load error, show it prominently
    if (elementLoadError) {
        return (
            <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-red-800 mb-1">Payment Form Failed to Load</p>
                        <p className="text-sm text-red-700 mb-2">{elementLoadError}</p>
                        <p className="text-xs text-red-600">
                            This usually happens when the payment session has expired or is invalid.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.history.back()}
                    >
                        Go Back
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        className="flex-1"
                        onClick={() => window.location.reload()}
                    >
                        Refresh Page
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Stripe Payment Element */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <PaymentElement
                    options={{
                        layout: "tabs",
                        paymentMethodOrder: ["card", "apple_pay", "google_pay"],
                    }}
                />
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
            )}

            {/* Submit Button */}
            <Button
                type="submit"
                variant="primary"
                className="w-full bg-indigo-600 hover:bg-indigo-700 py-3"
                disabled={isDisabled}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing Payment...
                    </>
                ) : (
                    <>
                        <Lock className="w-4 h-4 mr-2" />
                        Pay {formatPrice(amount, currency)}
                    </>
                )}
            </Button>

            {/* Security Note */}
            <p className="text-xs text-gray-500 text-center">
                Your payment is secured with 256-bit SSL encryption
            </p>
        </form>
    );
};
