import React from "react";
import { Badge } from "@/components/ui";
import { EmploymentType } from "@/types";
import { EMPLOYMENT_TYPE_LABELS } from "@/utils/constants";
import clsx from "clsx";

interface EmploymentTypeChipProps {
    type: EmploymentType;
    className?: string;
}

export const EmploymentTypeChip: React.FC<EmploymentTypeChipProps> = ({
    type,
    className,
}) => {
    return (
        <Badge variant="info" className={clsx("text-xs", className)}>
            {EMPLOYMENT_TYPE_LABELS[type] || type}
        </Badge>
    );
};
