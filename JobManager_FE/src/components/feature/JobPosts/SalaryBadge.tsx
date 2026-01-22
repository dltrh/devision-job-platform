import React from "react";
import { Badge } from "@/components/ui";
import { formatSalary } from "@/utils/jobPostHelpers";
import clsx from "clsx";

interface SalaryBadgeProps {
    min: number | null;
    max: number | null;
    type: string;
    note: string | null;
    className?: string;
}

/**
 * Display salary information with smart formatting
 * Uses database fields: salaryMin, salaryMax, salaryType, salaryNote
 */
export const SalaryBadge: React.FC<SalaryBadgeProps> = ({
    min,
    max,
    type,
    note,
    className,
}) => {
    const salaryDisplay = formatSalary(min, max, type, note);

    return (
        <Badge variant="neutral" className={clsx("font-semibold", className)}>
            {salaryDisplay}
        </Badge>
    );
};
