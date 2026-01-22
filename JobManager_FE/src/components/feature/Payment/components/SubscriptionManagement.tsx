import React, { useState } from "react";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Badge } from "@/components/ui/Badge/Badge";
import {
    Crown,
    Calendar,
    Clock,
    CreditCard,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Settings,
    ChevronRight,
    Bell,
    Search,
    Zap,
    ExternalLink,
} from "lucide-react";
import type { SubscriptionDetails } from "../types";

interface SubscriptionManagementProps {
    subscription: SubscriptionDetails;
    onRenew: () => void;
    onCancel: () => void;
    onUpgrade: () => void;
    isLoading?: boolean;
    isCancelling?: boolean;
}

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({
    subscription,
    onRenew,
    onCancel,
    onUpgrade,
    isLoading = false,
    isCancelling = false,
}) => {
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const isActive = subscription.status === "ACTIVE";
    const isExpired = subscription.status === "EXPIRED";
    const isCancelled = subscription.status === "CANCELLED";
    const isInactive = subscription.status === "INACTIVE";

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getStatusBadge = () => {
        switch (subscription.status) {
            case "ACTIVE":
                return (
                    <Badge variant="success" className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Premium Active
                    </Badge>
                );
            case "EXPIRED":
                return (
                    <Badge variant="error" className="flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        Expired
                    </Badge>
                );
            case "CANCELLED":
                return (
                    <Badge variant="warning" className="flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        Cancelled
                    </Badge>
                );
            default:
                return (
                    <Badge variant="neutral" className="flex items-center gap-1.5">
                        Free Plan
                    </Badge>
                );
        }
    };

    const getStatusIcon = () => {
        if (isActive) return <CheckCircle2 className="w-6 h-6 text-green-500" />;
        if (isExpired) return <XCircle className="w-6 h-6 text-red-500" />;
        if (isCancelled) return <XCircle className="w-6 h-6 text-orange-500" />;
        return <Crown className="w-6 h-6 text-gray-400" />;
    };

    const handleCancelClick = () => {
        setShowCancelConfirm(true);
    };

    const handleCancelConfirm = () => {
        onCancel();
        setShowCancelConfirm(false);
    };

    return (
        <div className="space-y-6">
            {/* Warning Banner - Expiring Soon */}
            {subscription.isExpiringSoon && isActive && (
                <Card padding="md" className="bg-amber-50 border-amber-300 border-l-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-grow">
                            <h4 className="font-semibold text-amber-900">
                                Your subscription will expire in {subscription.daysRemaining} days
                            </h4>
                            <p className="text-sm text-amber-800 mt-1">
                                Renew now to continue enjoying premium features without
                                interruption. You'll receive an email reminder before your
                                subscription ends.
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onRenew}
                            className="bg-amber-600 hover:bg-amber-700 flex-shrink-0"
                        >
                            Renew Now
                        </Button>
                    </div>
                </Card>
            )}

            {/* Expired Banner */}
            {isExpired && (
                <Card padding="md" className="bg-red-50 border-red-300 border-l-4">
                    <div className="flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-grow">
                            <h4 className="font-semibold text-red-900">
                                Your subscription has expired
                            </h4>
                            <p className="text-sm text-red-800 mt-1">
                                Renew your subscription to regain access to premium features like
                                applicant search and real-time notifications.
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={onRenew}
                            className="bg-red-600 hover:bg-red-700 flex-shrink-0"
                        >
                            Reactivate
                        </Button>
                    </div>
                </Card>
            )}

            {/* Main Status Card */}
            <Card padding="lg">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center ${
                                isActive
                                    ? "bg-gradient-to-r from-amber-100 to-yellow-100"
                                    : isExpired || isCancelled
                                      ? "bg-red-100"
                                      : "bg-gray-100"
                            }`}
                        >
                            {isActive ? (
                                <Crown className="w-7 h-7 text-amber-600" />
                            ) : (
                                getStatusIcon()
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Subscription Status</h2>
                            <div className="mt-1">{getStatusBadge()}</div>
                        </div>
                    </div>
                    {isActive && (
                        <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Settings className="w-4 h-4" />}
                        >
                            Settings
                        </Button>
                    )}
                </div>

                {/* Subscription Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <div className="flex items-center gap-2 text-gray-600">
                            <CreditCard className="w-4 h-4" />
                            <span>Current Plan</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                            {subscription.isPremium ? "Premium Company" : "Free"}
                        </span>
                    </div>

                    {subscription.isPremium && subscription.startDate && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>Start Date</span>
                            </div>
                            <span className="font-medium text-gray-900">
                                {formatDate(subscription.startDate)}
                            </span>
                        </div>
                    )}

                    {subscription.endDate && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>{isActive ? "Renewal Date" : "Expired On"}</span>
                            </div>
                            <span className="font-medium text-gray-900">
                                {formatDate(subscription.endDate)}
                            </span>
                        </div>
                    )}

                    {isActive && subscription.daysRemaining !== null && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>Days Remaining</span>
                            </div>
                            <span
                                className={`font-semibold ${
                                    subscription.daysRemaining <= 7
                                        ? "text-amber-600"
                                        : "text-gray-900"
                                }`}
                            >
                                {subscription.daysRemaining} days
                            </span>
                        </div>
                    )}

                    {isActive && (
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2 text-gray-600">
                                <RefreshCw className="w-4 h-4" />
                                <span>Auto-Renewal</span>
                            </div>
                            <Badge variant={subscription.autoRenew ? "success" : "neutral"}>
                                {subscription.autoRenew ? "Enabled" : "Disabled"}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    {isInactive && (
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={onUpgrade}
                            isLoading={isLoading}
                            leftIcon={<Crown className="w-4 h-4" />}
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                        >
                            Upgrade to Premium
                        </Button>
                    )}

                    {(isExpired || isCancelled) && (
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={onRenew}
                            isLoading={isLoading}
                            leftIcon={<RefreshCw className="w-4 h-4" />}
                        >
                            Renew Subscription
                        </Button>
                    )}

                    {isActive && !showCancelConfirm && (
                        <Button
                            variant="outline"
                            onClick={handleCancelClick}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                            Cancel Subscription
                        </Button>
                    )}
                </div>

                {/* Cancel Confirmation */}
                {showCancelConfirm && isActive && (
                    <Card padding="md" className="mt-4 bg-red-50 border-red-200">
                        <h4 className="font-semibold text-red-900 mb-2">
                            Are you sure you want to cancel?
                        </h4>
                        <p className="text-sm text-red-800 mb-4">
                            You'll continue to have access until {formatDate(subscription.endDate)}.
                            After that, you'll lose access to premium features.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowCancelConfirm(false)}
                            >
                                Keep Subscription
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={handleCancelConfirm}
                                isLoading={isCancelling}
                            >
                                Yes, Cancel
                            </Button>
                        </div>
                    </Card>
                )}
            </Card>

            {/* Premium Features Summary (for active users) */}
            {isActive && (
                <Card padding="lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Your Premium Features</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Bell className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 text-sm">
                                    Real-time Notifications
                                </h4>
                                <p className="text-xs text-gray-500">
                                    Instant alerts when candidates apply
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Search className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 text-sm">
                                    Applicant Search
                                </h4>
                                <p className="text-xs text-gray-500">
                                    Discover qualified candidates
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Zap className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 text-sm">
                                    Instant Matching
                                </h4>
                                <p className="text-xs text-gray-500">
                                    Kafka-powered candidate matching
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 text-sm">
                                    Unlimited Posts
                                </h4>
                                <p className="text-xs text-gray-500">No limits on job listings</p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Upgrade CTA (for non-premium users) */}
            {!subscription.isPremium && (
                <Card
                    padding="lg"
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Upgrade to Premium</h3>
                                <p className="text-indigo-100 text-sm">
                                    Unlock powerful hiring features for just $30/month
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={onUpgrade}
                            rightIcon={<ChevronRight className="w-4 h-4" />}
                            className="bg-white text-indigo-600 hover:bg-indigo-50"
                        >
                            View Plans
                        </Button>
                    </div>
                </Card>
            )}

            {/* Help Section */}
            <Card padding="md" className="bg-gray-50">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-gray-900">Need help?</h4>
                        <p className="text-sm text-gray-500">
                            Contact our support team for billing questions
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        rightIcon={<ExternalLink className="w-4 h-4" />}
                    >
                        Contact Support
                    </Button>
                </div>
            </Card>
        </div>
    );
};
