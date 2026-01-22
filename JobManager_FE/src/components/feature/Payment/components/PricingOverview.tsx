import React from "react";
import { Card } from "@/components/ui/Card/Card";
import { Crown, Zap, Bell, Search, Sparkles } from "lucide-react";
import { PREMIUM_PLAN, PREMIUM_FEATURES } from "../types";
import { SubscriptionPlanCard } from "@/components/feature/Subscription/components/SubscriptionPlanCard";
import type { SubscriptionPlan } from "@/components/feature/Subscription/types";

interface PricingOverviewProps {
    currentPlan?: "free" | "premium";
    onUpgrade: () => void;
    isLoading?: boolean;
}

export const PricingOverview: React.FC<PricingOverviewProps> = ({
    currentPlan = "free",
    onUpgrade,
    isLoading = false,
}) => {
    const isPremium = currentPlan === "premium";

    const getFeatureIcon = (featureId: string) => {
        switch (featureId) {
            case "real-time-notifications":
                return <Bell className="w-5 h-5" />;
            case "applicant-search":
                return <Search className="w-5 h-5" />;
            case "instant-matching":
                return <Zap className="w-5 h-5" />;
            default:
                return <Sparkles className="w-5 h-5" />;
        }
    };

    // Convert plans to SubscriptionPlan type
    const freePlan: Partial<SubscriptionPlan> = {
        id: "free-plan",
        name: "Free" as any, // Override type for display
        price: 0,
        currency: "USD",
        billingPeriod: "MONTHLY",
        features: [
            "Post up to 5 job listings",
            "Basic applicant management",
            "Email notifications",
        ],
    };

    const premiumPlan: SubscriptionPlan = {
        id: "premium-plan",
        name: "Premium", // Use actual plan name
        price: PREMIUM_PLAN.price,
        currency: "USD",
        billingPeriod: "MONTHLY",
        features: PREMIUM_FEATURES.map((f) => f.title),
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full mb-4">
                    <Crown className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Subscription Plans</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Plan</h1>
                <p className="text-gray-600">
                    Select the plan that best fits your recruitment needs.
                </p>
            </div>

            {/* Plan Comparison */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Free Plan */}
                <div
                    style={{
                        opacity: 0,
                        animation: "fadeInUp 0.5s ease-out forwards",
                        animationDelay: "0ms",
                    }}
                >
                    <SubscriptionPlanCard
                        plan={freePlan as SubscriptionPlan}
                        isCurrentPlan={!isPremium}
                        disabled={!isPremium}
                        onSelect={() => {}} // No action for free plan
                    />
                </div>

                {/* Premium Plan */}
                <div
                    style={{
                        opacity: 0,
                        animation: "fadeInUp 0.5s ease-out forwards",
                        animationDelay: "100ms",
                    }}
                >
                    <SubscriptionPlanCard
                        plan={premiumPlan}
                        isPopular={!isPremium}
                        isCurrentPlan={isPremium}
                        disabled={isLoading}
                        onSelect={isPremium ? undefined : onUpgrade}
                    />
                </div>
            </div>

            {/* Premium Features Highlight */}
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Premium Features in Detail
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {PREMIUM_FEATURES.filter((f) => f.isHighlighted).map((feature) => (
                        <Card key={feature.id} padding="md" className="bg-gray-50 border-gray-200">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                    <span className="text-gray-600">
                                        {getFeatureIcon(feature.id)}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h4>
                                <p className="text-sm text-gray-600">{feature.description}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
