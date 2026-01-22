/**
 * Utility functions for debugging Stripe integration issues
 */

/**
 * Validate that the Stripe publishable key is correctly configured
 */
export const validateStripeKey = (): { valid: boolean; error?: string } => {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!key) {
        return {
            valid: false,
            error: "VITE_STRIPE_PUBLISHABLE_KEY is not defined in environment variables",
        };
    }

    if (!key.startsWith("pk_")) {
        return {
            valid: false,
            error: "Invalid Stripe publishable key format (must start with 'pk_')",
        };
    }

    if (key.includes("pk_test_")) {
        console.info("✓ Using Stripe TEST mode");
    } else if (key.includes("pk_live_")) {
        console.warn("⚠️ Using Stripe LIVE mode - ensure backend is also in live mode");
    } else {
        return {
            valid: false,
            error: "Stripe key format is invalid (expected pk_test_* or pk_live_*)",
        };
    }

    return { valid: true };
};

/**
 * Parse client secret to extract payment intent information
 */
export const parseClientSecret = (
    clientSecret: string
): {
    paymentIntentId?: string;
    isTest: boolean;
    isValid: boolean;
} => {
    if (!clientSecret || typeof clientSecret !== "string") {
        return { isValid: false, isTest: false };
    }

    // Client secret format: pi_{id}_secret_{secret}
    const match = clientSecret.match(/^(pi_[a-zA-Z0-9]+)_secret_([a-zA-Z0-9]+)$/);

    if (!match) {
        return { isValid: false, isTest: false };
    }

    const paymentIntentId = match[1];
    const isTest = paymentIntentId.includes("_test_") || !paymentIntentId.startsWith("pi_live_");

    return {
        paymentIntentId,
        isTest,
        isValid: true,
    };
};

/**
 * Check if payment intent might be expired
 * Payment intents typically expire after 24 hours
 */
export const checkPaymentIntentAge = (
    createdAt?: string | Date
): {
    isExpired: boolean;
    ageInHours?: number;
} => {
    if (!createdAt) {
        return { isExpired: false };
    }

    const created = new Date(createdAt);
    const now = new Date();
    const ageInMs = now.getTime() - created.getTime();
    const ageInHours = ageInMs / (1000 * 60 * 60);

    // Payment intents expire after 24 hours
    const isExpired = ageInHours > 24;

    return { isExpired, ageInHours };
};

/**
 * Log Stripe configuration for debugging
 */
export const logStripeDebugInfo = (clientSecret?: string) => {
    console.group("🔍 Stripe Configuration Debug");

    // Check publishable key
    const keyValidation = validateStripeKey();
    if (keyValidation.valid) {
        console.log("✓ Publishable key is valid");
    } else {
        console.error("✗ Publishable key error:", keyValidation.error);
    }

    // Check client secret
    if (clientSecret) {
        const secretInfo = parseClientSecret(clientSecret);
        if (secretInfo.isValid) {
            console.log("✓ Client secret is valid");
            console.log(`  Payment Intent ID: ${secretInfo.paymentIntentId}`);
            console.log(`  Mode: ${secretInfo.isTest ? "TEST" : "LIVE"}`);
        } else {
            console.error("✗ Client secret is invalid");
        }
    } else {
        console.warn("⚠️ No client secret provided");
    }

    // Environment info
    console.log("Environment:", import.meta.env.VITE_ENV);
    console.log("API URL:", import.meta.env.VITE_PAYMENT_API_URL);

    console.groupEnd();
};

/**
 * Common Stripe error messages and their solutions
 */
export const STRIPE_ERROR_SOLUTIONS: Record<string, string> = {
    "401": "Payment session expired or invalid. Please create a new payment.",
    Unauthorized: "Payment session expired. Please go back and try again.",
    "Invalid client_secret": "The payment session is no longer valid. Please create a new payment.",
    "You cannot confirm this PaymentIntent":
        "This payment has already been processed or cancelled.",
    requires_payment_method: "Payment method is required. Please enter your card details.",
    card_declined: "Your card was declined. Please try a different payment method.",
    insufficient_funds: "Insufficient funds. Please use a different card.",
};

/**
 * Get a user-friendly error message for Stripe errors
 */
export const getStripeErrorMessage = (error: any): string => {
    const errorMessage = error?.message || error?.toString() || "";

    // Check for known error patterns
    for (const [key, solution] of Object.entries(STRIPE_ERROR_SOLUTIONS)) {
        if (errorMessage.includes(key)) {
            return solution;
        }
    }

    // Default message
    return errorMessage || "An unexpected error occurred with the payment system.";
};
