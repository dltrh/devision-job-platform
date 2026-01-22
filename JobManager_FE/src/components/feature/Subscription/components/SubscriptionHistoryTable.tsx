import React from "react";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import type { SubscriptionHistory } from "../types";

export interface SubscriptionHistoryTableProps {
    history: SubscriptionHistory[];
    isLoading?: boolean;
}

export const SubscriptionHistoryTable: React.FC<SubscriptionHistoryTableProps> = ({
    history,
    isLoading = false,
}) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatCurrency = (amount: number, currency: string) => {
        return `${currency === "USD" ? "$" : currency}${amount.toFixed(2)}`;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "SUCCESS":
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "FAILED":
                return <XCircle className="w-4 h-4 text-red-500" />;
            case "PENDING":
                return <Clock className="w-4 h-4 text-yellow-500" />;
            default:
                return null;
        }
    };

    const getStatusBadgeVariant = (status: string): "success" | "error" | "warning" | "neutral" => {
        switch (status) {
            case "SUCCESS":
                return "success";
            case "FAILED":
                return "error";
            case "PENDING":
                return "warning";
            default:
                return "neutral";
        }
    };

    if (isLoading) {
        return (
            <Card padding="lg">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading history...</p>
                </div>
            </Card>
        );
    }

    if (history.length === 0) {
        return (
            <Card padding="lg">
                <div className="text-center py-8">
                    <p className="text-gray-500">No subscription history found.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card padding="none">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Plan
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Payment Method
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Period
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {history.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(record.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {record.planName}
                                    {record.amount === 0 && (
                                        <span className="ml-2 text-xs text-gray-500">(Status Update)</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {record.amount > 0 ? formatCurrency(record.amount, record.currency) : "—"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {record.paymentMethod}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {formatDate(record.startDate)} - {formatDate(record.endDate)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(record.status)}
                                        <Badge variant={getStatusBadgeVariant(record.status)}>
                                            {record.status}
                                        </Badge>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
