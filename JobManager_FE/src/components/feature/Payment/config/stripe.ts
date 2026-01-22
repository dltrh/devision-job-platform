import { loadStripe } from "@stripe/stripe-js";

// Stripe publishable key - should match your backend's secret key mode (test/live)
// IMPORTANT: The publishable key must match the mode of your secret key!
// - If backend uses sk_test_... → use pk_test_...
// - If backend uses sk_live_... → use pk_live_...
//
// Get your test publishable key from: https://dashboard.stripe.com/test/apikeys
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
    console.error(
        "Missing VITE_STRIPE_PUBLISHABLE_KEY environment variable. " +
            "Please add it to your .env.development file."
    );
}

// Load Stripe instance (singleton pattern)
export const stripePromise = STRIPE_PUBLISHABLE_KEY
    ? loadStripe(STRIPE_PUBLISHABLE_KEY)
    : Promise.resolve(null);

// Stripe Elements appearance configuration
export const stripeAppearance = {
    theme: "stripe" as const,
    variables: {
        colorPrimary: "#4f46e5", // Indigo-600
        colorBackground: "#ffffff",
        colorText: "#1f2937",
        colorDanger: "#dc2626",
        fontFamily: "system-ui, sans-serif",
        borderRadius: "8px",
        spacingUnit: "4px",
    },
    rules: {
        ".Input": {
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        },
        ".Input:focus": {
            border: "1px solid #4f46e5",
            boxShadow: "0 0 0 1px #4f46e5",
        },
        ".Label": {
            fontWeight: "500",
            fontSize: "14px",
            marginBottom: "6px",
        },
    },
};
