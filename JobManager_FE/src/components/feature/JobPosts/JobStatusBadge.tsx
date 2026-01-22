import React from "react";
import { Badge } from "@/components/ui";
import { JobStatus } from "@/types";
import { JOB_STATUS } from "@/utils/constants";
import clsx from "clsx";

interface JobStatusBadgeProps {
    status: JobStatus;
    className?: string;
}

export const JobStatusBadge: React.FC<JobStatusBadgeProps> = ({
    status,
    className,
}) => {
    const getStatusConfig = (status: JobStatus) => {
        switch (status) {
            case JOB_STATUS.PUBLISHED:
                return {
                    variant: "success" as const,
                    label: "Published",
                };
            case JOB_STATUS.DRAFT:
                return {
                    variant: "neutral" as const,
                    label: "Draft",
                };
            case JOB_STATUS.PRIVATE:
                return {
                    variant: "info" as const,
                    label: "🔒 Private",
                };
            case JOB_STATUS.ARCHIVED:
                return {
                    variant: "warning" as const,
                    label: "Archived",
                };
            case JOB_STATUS.CLOSED:
                return {
                    variant: "error" as const,
                    label: "Closed",
                };
            default:
                return {
                    variant: "neutral" as const,
                    label: status,
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <Badge variant={config.variant} className={clsx(className)}>
            {config.label}
        </Badge>
    );
};
