import { SUBSCRIPTION_STATUS } from "@/utils/constants";

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

export interface SubscriptionStatusResponse {
    companyId: string;
    status: SubscriptionStatus;
    endAt: string | null;
    isPremium: boolean;
}

export interface SubscriptionResponse {
    id: string;
    companyId: string;
    status: SubscriptionStatus;
    startAt: string;
    endAt: string;
    isPremium: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSubscriptionRequest {
    companyId: string;
    status?: SubscriptionStatus;
    startAt?: string;
    endAt?: string;
}

export interface UpdateSubscriptionRequest {
    status?: SubscriptionStatus;
    startAt?: string;
    endAt?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export type PaymentMethodType = "STRIPE" | "PAYPAL";

export interface PaymentMethod {
    id: string;
    type: PaymentMethodType;
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    email?: string;
    isDefault: boolean;
    createdAt: string;
}

export interface SubscriptionPlan {
    id: string;
    name: "Free" | "Premium";
    price: number;
    currency: string;
    billingPeriod: "MONTHLY" | "YEARLY";
    features: string[];
}

export interface CreatePaymentIntentRequest {
    companyId: string;
    planId: string;
    paymentMethodType: PaymentMethodType;
}

export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
}

export interface SubscriptionPurchaseRequest {
    companyId: string;
    planId: string;
    paymentMethodId: string;
    paymentIntentId: string;
}

export interface SubscriptionHistory {
    id: string;
    companyId: string;
    planName: string;
    amount: number;
    currency: string;
    status: "SUCCESS" | "FAILED" | "PENDING";
    paymentMethod: PaymentMethodType;
    startDate: string;
    endDate: string;
    createdAt: string;
}

// Unified timeline entry combining payments and subscription events
export type TimelineEntryType = "PAYMENT" | "SUBSCRIPTION_START" | "SUBSCRIPTION_CANCELLED" | "SUBSCRIPTION_RENEWED";

export interface TimelineEntry {
    id: string;
    type: TimelineEntryType;
    date: string;
    title: string;
    description: string;
    amount?: number;
    currency?: string;
    status?: "SUCCESS" | "FAILED" | "PENDING" | "ACTIVE" | "CANCELLED";
    metadata?: {
        paymentMethod?: PaymentMethodType;
        subscriptionEndDate?: string;
        subscriptionStatus?: SubscriptionStatus;
    };
}

export interface SubscriptionNotification {
    id: string;
    companyId: string;
    emailNotifications: boolean;
    notifyDaysBefore: number;
}
