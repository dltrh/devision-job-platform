import React from "react";
import { SyncStatus } from "@/types";
import { SYNC_STATUS } from "@/utils/constants";
import clsx from "clsx";

interface KafkaSyncIndicatorProps {
    status: SyncStatus;
    className?: string;
    showLabel?: boolean;
}

export const KafkaSyncIndicator: React.FC<KafkaSyncIndicatorProps> = ({
    status,
    className,
    showLabel = true,
}) => {
    const getStatusConfig = (status: SyncStatus) => {
        switch (status) {
            case SYNC_STATUS.SYNCED:
                return {
                    icon: "✓",
                    label: "Synced",
                    color: "text-green-600",
                    bg: "bg-green-50",
                };
            case SYNC_STATUS.UPDATING:
                return {
                    icon: "⟳",
                    label: "Updating...",
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                };
            case SYNC_STATUS.PENDING:
                return {
                    icon: "⏱",
                    label: "Pending",
                    color: "text-yellow-600",
                    bg: "bg-yellow-50",
                };
            case SYNC_STATUS.FAILED:
                return {
                    icon: "⚠",
                    label: "Failed",
                    color: "text-red-600",
                    bg: "bg-red-50",
                };
            default:
                return {
                    icon: "•",
                    label: "Unknown",
                    color: "text-gray-600",
                    bg: "bg-gray-50",
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <div
            className={clsx(
                "inline-flex items-center gap-1 px-2 py-1 rounded text-xs",
                config.bg,
                config.color,
                className
            )}
            title={`Kafka sync: ${config.label}`}
        >
            <span className="font-medium">{config.icon}</span>
            {showLabel && (
                <span className="text-xs">Kafka: {config.label}</span>
            )}
        </div>
    );
};
