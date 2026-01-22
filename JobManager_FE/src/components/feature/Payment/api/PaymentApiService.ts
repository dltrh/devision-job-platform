import httpClient from "@/services/httpClient";
import { API_ENDPOINTS } from "@/utils/backendAPIs";
import { getCompanyId, getStoredUser } from "@/services/authStorage";
import type {
    SubscriptionStatusResponse,
    PaymentIntentResponse,
    ApiResponse,
    SubscriptionHistory,
} from "@/components/feature/Subscription/types";
import type { SubscriptionDetails } from "../types";

// Extended API endpoints for payment service
const PAYMENT_ENDPOINTS = {
    CREATE_PAYMENT: "/internal/payment",
    GET_PAYMENT: (paymentId: string) => `/internal/payment/${paymentId}`,
    GET_PAYMENTS_BY_PAYER: (payerId: string) => `/internal/payment/payer/${payerId}/type/COMPANY`,
    CANCEL_PAYMENT: (paymentId: string) => `/internal/payment/${paymentId}/cancel`,
};

// Extended subscription endpoints
const SUBSCRIPTION_ENDPOINTS = {
    GET_BY_COMPANY: (companyId: string) => `/internal/subscriptions/company/${companyId}`,
    CREATE: "/internal/subscriptions",
    ACTIVATE: (subscriptionId: string) => `/internal/subscriptions/${subscriptionId}/activate`,
    CANCEL: (subscriptionId: string) => `/internal/subscriptions/${subscriptionId}/cancel`,
};

/**
 * Get subscription status for the current company
 */
export const getSubscriptionStatus = async (): Promise<ApiResponse<SubscriptionStatusResponse>> => {
    const companyId = getCompanyId();
    if (!companyId) {
        return {
            success: true,
            message: "No company ID found",
            data: {
                companyId: "",
                status: "INACTIVE",
                endAt: null,
                isPremium: false,
            },
        };
    }

    try {
        const response = await httpClient.get<ApiResponse<SubscriptionStatusResponse>>(
            API_ENDPOINTS.SUBSCRIPTIONS.STATUS(companyId)
        );
        return response.data;
    } catch (error: any) {
        // Return default inactive status if endpoint fails
        return {
            success: true,
            message: "Subscription not found",
            data: {
                companyId,
                status: "INACTIVE",
                endAt: null,
                isPremium: false,
            },
        };
    }
};

/**
 * Get detailed subscription info for the current company
 */
export const getDetailedSubscription = async (): Promise<ApiResponse<SubscriptionDetails>> => {
    const companyId = getCompanyId();
    if (!companyId) {
        return {
            success: false,
            message: "No company ID found",
            data: getDefaultSubscriptionDetails(""),
        };
    }

    try {
        const response = await httpClient.get<ApiResponse<any>>(
            SUBSCRIPTION_ENDPOINTS.GET_BY_COMPANY(companyId)
        );

        if (response.data.success && response.data.data) {
            const sub = response.data.data;
            const details = transformToSubscriptionDetails(sub);
            return {
                success: true,
                message: "Subscription retrieved",
                data: details,
            };
        }

        return {
            success: true,
            message: "No subscription found",
            data: getDefaultSubscriptionDetails(companyId),
        };
    } catch (error: any) {
        // Return default inactive status if endpoint fails
        return {
            success: true,
            message: "Subscription not found",
            data: getDefaultSubscriptionDetails(companyId),
        };
    }
};

/**
 * Check if company is premium
 */
export const checkIsPremium = async (): Promise<ApiResponse<boolean>> => {
    const companyId = getCompanyId();
    if (!companyId) {
        return {
            success: true,
            message: "No company ID found",
            data: false,
        };
    }

    try {
        const response = await httpClient.get<ApiResponse<boolean>>(
            API_ENDPOINTS.SUBSCRIPTIONS.IS_PREMIUM(companyId)
        );
        return response.data;
    } catch (error: any) {
        return {
            success: true,
            message: "Premium check failed",
            data: false,
        };
    }
};

/**
 * Create a payment intent for subscription purchase via Stripe
 */
export const createPaymentIntent = async (
    amount: number,
    currency: string = "USD",
    description: string = "Premium Subscription"
): Promise<ApiResponse<PaymentIntentResponse>> => {
    const companyId = getCompanyId();
    const user = getStoredUser();

    if (!companyId || !user?.email) {
        throw new Error("Company ID or email not found");
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(companyId)) {
        throw new Error("Invalid company ID format. Expected UUID.");
    }

    const request = {
        payerType: "COMPANY",
        payerId: companyId, // Already a UUID string
        email: user.email,
        amount: Number(amount.toFixed(2)), // Ensure proper decimal format
        currency: currency.toUpperCase(), // Ensure uppercase (e.g., USD)
        description: description,
    };

    try {
        const response = await httpClient.post<ApiResponse<PaymentIntentResponse>>(
            PAYMENT_ENDPOINTS.CREATE_PAYMENT,
            request
        );
        return response.data;
    } catch (error: any) {
        console.error("Error creating payment intent:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get payment status by ID
 */
export const getPaymentStatus = async (paymentId: string): Promise<ApiResponse<any>> => {
    const response = await httpClient.get<ApiResponse<any>>(
        PAYMENT_ENDPOINTS.GET_PAYMENT(paymentId)
    );
    return response.data;
};

/**
 * Get payment history for current company
 */
export const getPaymentHistory = async (): Promise<ApiResponse<SubscriptionHistory[]>> => {
    const companyId = getCompanyId();
    if (!companyId) {
        return {
            success: true,
            message: "No company ID found",
            data: [],
        };
    }

    try {
        const response = await httpClient.get<ApiResponse<any[]>>(
            PAYMENT_ENDPOINTS.GET_PAYMENTS_BY_PAYER(companyId)
        );

        // Transform payment records to subscription history format
        const history: SubscriptionHistory[] = (response.data.data || []).map((payment: any) => ({
            id: payment.paymentId || payment.id,
            companyId: companyId,
            planName: "Premium Company Subscription",
            amount: payment.amount || 30,
            currency: payment.currency || "USD",
            status: mapPaymentStatus(payment.status),
            paymentMethod: "STRIPE",
            startDate: payment.createdAt,
            endDate: payment.completedAt,
            createdAt: payment.createdAt,
        }));

        return {
            success: true,
            message: "Payment history retrieved",
            data: history,
        };
    } catch (error: any) {
        return {
            success: true,
            message: "No payment history found",
            data: [],
        };
    }
};

/**
 * Cancel a pending payment
 */
export const cancelPayment = async (paymentId: string): Promise<ApiResponse<any>> => {
    const response = await httpClient.patch<ApiResponse<any>>(
        PAYMENT_ENDPOINTS.CANCEL_PAYMENT(paymentId)
    );
    return response.data;
};

/**
 * Create a new subscription after successful payment
 */
export const createSubscription = async (durationMonths: number = 1): Promise<ApiResponse<any>> => {
    const companyId = getCompanyId();
    if (!companyId) {
        throw new Error("Company ID not found");
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const request = {
        companyId: companyId,
        status: "ACTIVE",
        startAt: now.toISOString(),
        endAt: endDate.toISOString(),
    };

    const response = await httpClient.post<ApiResponse<any>>(
        SUBSCRIPTION_ENDPOINTS.CREATE,
        request
    );
    return response.data;
};

/**
 * Activate an existing subscription
 */
export const activateSubscription = async (subscriptionId: string): Promise<ApiResponse<any>> => {
    const response = await httpClient.patch<ApiResponse<any>>(
        SUBSCRIPTION_ENDPOINTS.ACTIVATE(subscriptionId)
    );
    return response.data;
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (subscriptionId: string): Promise<ApiResponse<any>> => {
    const response = await httpClient.patch<ApiResponse<any>>(
        SUBSCRIPTION_ENDPOINTS.CANCEL(subscriptionId)
    );
    return response.data;
};

// Helper functions
function getDefaultSubscriptionDetails(companyId: string): SubscriptionDetails {
    return {
        id: "",
        companyId,
        status: "INACTIVE",
        isPremium: false,
        currentPlan: "Free",
        startDate: null,
        endDate: null,
        nextBillingDate: null,
        autoRenew: false,
        daysRemaining: null,
        isExpiringSoon: false,
    };
}

function transformToSubscriptionDetails(sub: any): SubscriptionDetails {
    const now = new Date();
    const endDate = sub.endAt ? new Date(sub.endAt) : null;
    let daysRemaining: number | null = null;
    let isExpiringSoon = false;

    if (endDate && sub.status === "ACTIVE") {
        const diffTime = endDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isExpiringSoon = daysRemaining > 0 && daysRemaining <= 7;
    }

    return {
        id: sub.id,
        companyId: sub.companyId,
        status: sub.status,
        isPremium: sub.isPremium || sub.status === "ACTIVE",
        currentPlan:
            sub.isPremium || sub.status === "ACTIVE" ? "Premium Company Subscription" : "Free",
        startDate: sub.startAt,
        endDate: sub.endAt,
        nextBillingDate: sub.endAt,
        autoRenew: sub.status === "ACTIVE",
        daysRemaining,
        isExpiringSoon,
    };
}

function mapPaymentStatus(status: string): "SUCCESS" | "FAILED" | "PENDING" {
    switch (status?.toUpperCase()) {
        case "SUCCEEDED":
        case "COMPLETED":
        case "SUCCESS":
            return "SUCCESS";
        case "FAILED":
        case "CANCELLED":
        case "CANCELED":
            return "FAILED";
        default:
            return "PENDING";
    }
}

const PaymentApiService = {
    getSubscriptionStatus,
    getDetailedSubscription,
    checkIsPremium,
    createPaymentIntent,
    getPaymentStatus,
    getPaymentHistory,
    cancelPayment,
    createSubscription,
    activateSubscription,
    cancelSubscription,
};

export default PaymentApiService;
