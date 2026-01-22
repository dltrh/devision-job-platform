import httpClient from "@/services/httpClient";
import { API_ENDPOINTS } from "@/utils/backendAPIs";
import { getCompanyId } from "@/services/authStorage";
import type {
    ApiResponse,
    SubscriptionStatusResponse,
    SubscriptionResponse,
    SubscriptionPlan,
    CreatePaymentIntentRequest,
    PaymentIntentResponse,
    SubscriptionPurchaseRequest,
    SubscriptionHistory,
} from "../types";

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
    const response = await httpClient.get<ApiResponse<SubscriptionStatusResponse>>(
        API_ENDPOINTS.SUBSCRIPTIONS.STATUS(companyId)
    );
    return response.data;
};

export const checkIsPremium = async (): Promise<ApiResponse<boolean>> => {
    const companyId = getCompanyId();
    if (!companyId) {
        return {
            success: true,
            message: "No company ID found",
            data: false,
        };
    }
    const response = await httpClient.get<ApiResponse<boolean>>(
        API_ENDPOINTS.SUBSCRIPTIONS.IS_PREMIUM(companyId)
    );
    return response.data;
};

export const getSubscriptionPlans = async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
    // const response = await httpClient.get<ApiResponse<SubscriptionPlan[]>>(
    //     API_ENDPOINTS.SUBSCRIPTIONS.PLANS
    // );
    // return response.data;

    // Temporarily disabled - return empty data
    return {
        success: true,
        message: "Plans API temporarily disabled",
        data: [],
    };
};

export const getSubscriptionPlan = async (
    planId: string
): Promise<ApiResponse<SubscriptionPlan>> => {
    // const response = await httpClient.get<ApiResponse<SubscriptionPlan>>(
    //     API_ENDPOINTS.SUBSCRIPTIONS.PLAN(planId)
    // );
    // return response.data;

    // Temporarily disabled - return empty data
    return {
        success: false,
        message: "Plan API temporarily disabled",
        data: null as any,
    };
};

export const createPaymentIntent = async (
    request: CreatePaymentIntentRequest
): Promise<ApiResponse<PaymentIntentResponse>> => {
    const response = await httpClient.post<ApiResponse<PaymentIntentResponse>>(
        API_ENDPOINTS.SUBSCRIPTIONS.CREATE_PAYMENT_INTENT,
        request
    );
    return response.data;
};

export const purchaseSubscription = async (
    request: SubscriptionPurchaseRequest
): Promise<ApiResponse<SubscriptionStatusResponse>> => {
    const response = await httpClient.post<ApiResponse<SubscriptionStatusResponse>>(
        API_ENDPOINTS.SUBSCRIPTIONS.PURCHASE,
        request
    );
    return response.data;
};

export const getSubscriptionHistory = async (): Promise<ApiResponse<SubscriptionHistory[]>> => {
    const companyId = getCompanyId();
    if (!companyId) {
        console.log("[Subscription History] No company ID found");
        return {
            success: true,
            message: "No company ID found",
            data: [],
        };
    }

    try {
        // Fetch BOTH payment history AND current subscription status
        console.log(
            "[Subscription History] Fetching combined payment + subscription data for company:",
            companyId
        );

        // 1. Fetch payment history: GET /api/payment/payer/{payerId}/type/COMPANY
        const paymentEndpoint = API_ENDPOINTS.PAYMENT.HISTORY_BY_PAYER(companyId, "COMPANY");
        console.log("[Subscription History] Payment endpoint:", paymentEndpoint);

        // 2. Fetch subscription info: GET /api/subscriptions/company/{companyId}
        const subscriptionEndpoint = API_ENDPOINTS.SUBSCRIPTIONS.STATUS(companyId);
        console.log("[Subscription History] Subscription endpoint:", subscriptionEndpoint);

        // Execute both requests in parallel
        const [paymentResponse, subscriptionResponse] = await Promise.allSettled([
            httpClient.get<ApiResponse<any[]>>(paymentEndpoint),
            httpClient.get<ApiResponse<SubscriptionStatusResponse>>(subscriptionEndpoint),
        ]);

        console.log("[Subscription History] Payment response:", paymentResponse);
        console.log("[Subscription History] Subscription response:", subscriptionResponse);

        const history: SubscriptionHistory[] = [];

        // Process payment history
        if (paymentResponse.status === "fulfilled" && paymentResponse.value.data.success) {
            const payments = paymentResponse.value.data.data || [];
            console.log("[Subscription History] Found", payments.length, "payments");

            payments.forEach((payment: any) => {
                history.push({
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
                });
            });
        }

        // Add subscription status as a history entry ONLY if it's an actual premium subscription
        // Don't show "Free Plan" status entries - they clutter the history
        if (
            subscriptionResponse.status === "fulfilled" &&
            subscriptionResponse.value.data.success
        ) {
            const subscription = subscriptionResponse.value.data.data;
            console.log("[Subscription History] Current subscription:", subscription);

            // Only add subscription entry if user is/was premium (not for free plan users)
            if (subscription && subscription.isPremium && subscription.status === "ACTIVE") {
                // Only add if there's no payment history entry for this subscription period
                const hasMatchingPayment = history.some(
                    (h) => h.status === "SUCCESS" && h.amount > 0
                );

                if (!hasMatchingPayment) {
                    const statusEntry: SubscriptionHistory = {
                        id: `sub-status-${Date.now()}`,
                        companyId: companyId,
                        planName: "Premium Company Subscription",
                        amount: 0,
                        currency: "USD",
                        status: "SUCCESS",
                        paymentMethod: "STRIPE",
                        startDate: subscription.endAt || new Date().toISOString(),
                        endDate: subscription.endAt || new Date().toISOString(),
                        createdAt: subscription.endAt || new Date().toISOString(),
                    };
                    history.push(statusEntry);
                }
            }
        }

        // Sort by date (most recent first)
        history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        console.log("[Subscription History] Combined unified history:", history);

        return {
            success: true,
            message: "Payment and subscription history retrieved",
            data: history,
        };
    } catch (error: any) {
        console.error("[Subscription History] Error fetching history:", error);
        console.error("[Subscription History] Error response:", error.response?.data);
        return {
            success: true,
            message: "No history found",
            data: [],
        };
    }
};

// Helper function to map payment status
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

/**
 * Get subscription by company ID (internal endpoint)
 */
export const getSubscriptionByCompanyId = async (): Promise<ApiResponse<SubscriptionResponse>> => {
    const companyId = getCompanyId();
    if (!companyId) {
        throw new Error("No company ID found");
    }
    const response = await httpClient.get<ApiResponse<SubscriptionResponse>>(
        API_ENDPOINTS.SUBSCRIPTIONS.GET_BY_COMPANY(companyId)
    );
    return response.data;
};

export const cancelSubscription = async (): Promise<ApiResponse<SubscriptionStatusResponse>> => {
    const companyId = getCompanyId();
    if (!companyId) {
        throw new Error("No company ID found");
    }

    // First, get the subscription to retrieve its ID
    const subscriptionResponse = await getSubscriptionByCompanyId();
    if (!subscriptionResponse.success || !subscriptionResponse.data?.id) {
        throw new Error("No active subscription found for this company");
    }

    const subscriptionId = subscriptionResponse.data.id;

    // Cancel using the subscription ID (PATCH request)
    const response = await httpClient.patch<ApiResponse<SubscriptionStatusResponse>>(
        API_ENDPOINTS.SUBSCRIPTIONS.CANCEL(subscriptionId)
    );
    return response.data;
};

export const renewSubscription = async (
    planId: string
): Promise<ApiResponse<SubscriptionStatusResponse>> => {
    const companyId = getCompanyId();
    if (!companyId) {
        throw new Error("No company ID found");
    }
    const response = await httpClient.post<ApiResponse<SubscriptionStatusResponse>>(
        API_ENDPOINTS.SUBSCRIPTIONS.RENEW(companyId),
        { planId }
    );
    return response.data;
};

const SubscriptionService = {
    getSubscriptionStatus,
    checkIsPremium,
    getSubscriptionPlans,
    getSubscriptionPlan,
    createPaymentIntent,
    purchaseSubscription,
    getSubscriptionHistory,
    getSubscriptionByCompanyId,
    cancelSubscription,
    renewSubscription,
};

export default SubscriptionService;
