import React from "react";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Badge } from "@/components/ui/Badge/Badge";
import { AlertCircle, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import clsx from "clsx";
import type { SubscriptionStatusResponse } from "../types";

export interface SubscriptionStatusCardProps {
    status: SubscriptionStatusResponse;
    onUpgrade?: () => void;
    onRenew?: () => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({
    status,
    onUpgrade,
    onRenew,
    onCancel,
    isLoading = false,
}) => {
    const getStatusIcon = () => {
        switch (status.status) {
            case "ACTIVE":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "EXPIRED":
                return <XCircle className="w-5 h-5 text-red-500" />;
            case "CANCELLED":
                return <XCircle className="w-5 h-5 text-orange-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusBadgeVariant = (): "success" | "error" | "warning" | "neutral" => {
        switch (status.status) {
            case "ACTIVE":
                return "success";
            case "EXPIRED":
                return "error";
            case "CANCELLED":
                return "warning";
            default:
                return "neutral";
        }
    };

    const getStatusText = () => {
        switch (status.status) {
            case "ACTIVE":
                return "Active";
            case "EXPIRED":
                return "Expired";
            case "CANCELLED":
                return "Cancelled";
            case "INACTIVE":
                return "Inactive";
            default:
                return status.status;
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getDaysRemaining = () => {
        if (!status.endAt) return null;
        const endDate = new Date(status.endAt);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysRemaining = getDaysRemaining();
    const isExpiringSoon = daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7;

    return (
        <Card padding="lg">
            <div className="space-y-6">

                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {getStatusIcon()}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Subscription Status
                            </h2>
                            <Badge variant={getStatusBadgeVariant()} className="mt-1">
                                {getStatusText()}
                            </Badge>
                        </div>
                    </div>
                </div>

 
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Premium Status:</span>
                            <Badge variant={status.isPremium ? "success" : "neutral"}>
                                {status.isPremium ? "Premium" : "Free"}
                            </Badge>
                        </div>
                    </div>
                </div>


                {status.status !== "INACTIVE" && status.endAt && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                                End Date: <span className="font-medium">{formatDate(status.endAt)}</span>
                            </span>
                        </div>

                        {daysRemaining !== null && daysRemaining > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">
                                    Days Remaining: <span className="font-medium">{daysRemaining}</span>
                                </span>
                            </div>
                        )}
                    </div>
                )}


                {isExpiringSoon && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-900">
                                    Your subscription is expiring soon
                                </p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Renew now to continue enjoying premium features without interruption.
                                </p>
                            </div>
                        </div>
                    </div>
                )}


                {status.status === "EXPIRED" && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-900">
                                    Your subscription has expired
                                </p>
                                <p className="text-sm text-red-700 mt-1">
                                    Renew your subscription to regain access to premium features.
                                </p>
                            </div>
                        </div>
                    </div>
                )}


                <div className="flex gap-3 pt-2">
                    {status.status === "INACTIVE" && onUpgrade && (
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={onUpgrade}
                            isLoading={isLoading}
                        >
                            Upgrade to Premium
                        </Button>
                    )}

                    {(status.status === "EXPIRED" || status.status === "CANCELLED" || isExpiringSoon) && onRenew && (
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={onRenew}
                            isLoading={isLoading}
                        >
                            Renew Subscription
                        </Button>
                    )}

                    {status.status === "ACTIVE" && onCancel && (
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={onCancel}
                            isLoading={isLoading}
                        >
                            Cancel Subscription
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};
