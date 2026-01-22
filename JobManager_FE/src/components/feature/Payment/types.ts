// Payment Feature Types

export type PaymentStep = "pricing" | "confirm" | "gateway" | "result";

export type PaymentResultStatus = "success" | "failure" | "pending";

export type PaymentGateway = "stripe" | "paypal";

export interface PremiumPlan {
    id: string;
    name: string;
    price: number;
    currency: string;
    billingPeriod: "monthly";
    features: PremiumFeature[];
    description: string;
}

export interface PremiumFeature {
    id: string;
    title: string;
    description: string;
    icon?: string;
    isHighlighted?: boolean;
}

export interface SubscriptionConfirmation {
    planId: string;
    planName: string;
    price: number;
    currency: string;
    billingCycle: string;
    companyEmail: string;
    agreedToTerms: boolean;
}

export interface PaymentIntentData {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
    gateway: PaymentGateway;
}

export interface PaymentResultData {
    status: PaymentResultStatus;
    transactionId?: string;
    subscriptionStartDate?: string;
    nextBillingDate?: string;
    errorMessage?: string;
    errorCode?: string;
}

export interface SubscriptionDetails {
    id: string;
    companyId: string;
    status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "CANCELLED";
    isPremium: boolean;
    currentPlan: string;
    startDate: string | null;
    endDate: string | null;
    nextBillingDate: string | null;
    autoRenew: boolean;
    daysRemaining: number | null;
    isExpiringSoon: boolean;
}

export interface PaymentFlowState {
    step: PaymentStep;
    selectedPlan: PremiumPlan | null;
    confirmation: SubscriptionConfirmation | null;
    paymentIntent: PaymentIntentData | null;
    result: PaymentResultData | null;
    isLoading: boolean;
    error: string | null;
}

// Premium Features Constants
export const PREMIUM_FEATURES: PremiumFeature[] = [
    {
        id: "real-time-notifications",
        title: "Real-time Applicant Notifications",
        description:
            "Get instant notifications when candidates apply to your job posts via Kafka-powered event streaming.",
        isHighlighted: true,
    },
    {
        id: "applicant-search",
        title: "Applicant Profile Search",
        description:
            "Search and discover qualified candidates from our talent pool before they even apply.",
        isHighlighted: true,
    },
    {
        id: "instant-matching",
        title: "Kafka-powered Instant Matching",
        description:
            "Leverage our real-time event-driven architecture for instant candidate-job matching.",
        isHighlighted: true,
    },
    {
        id: "unlimited-posts",
        title: "Unlimited Job Posts",
        description: "Post as many job opportunities as you need without restrictions.",
    },
    {
        id: "priority-support",
        title: "Priority Customer Support",
        description: "Get faster response times and dedicated support for your hiring needs.",
    },
    {
        id: "analytics",
        title: "Advanced Analytics Dashboard",
        description: "Track application trends, candidate engagement, and hiring metrics.",
    },
];

// Default Premium Plan
export const PREMIUM_PLAN: PremiumPlan = {
    id: "premium-monthly",
    name: "Premium Company Subscription",
    price: 30,
    currency: "USD",
    billingPeriod: "monthly",
    features: PREMIUM_FEATURES,
    description: "Unlock all premium features and supercharge your hiring process.",
};
