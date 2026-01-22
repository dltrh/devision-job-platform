import React from "react";
import { useNavigate } from "react-router-dom";
import { JobPost } from "@/types";
import { SYNC_STATUS, ROUTES, JOB_STATUS } from "@/utils/constants";
import { formatExpiryDate, isExpiringSoon } from "@/utils/jobPostHelpers";
import { JobStatusBadge, EmploymentTypeChip, SalaryBadge, KafkaSyncIndicator } from "./index";
import { Button } from "@/components/ui";
import { SkillsList } from "@/components/common/SkillsList";
import { Archive } from "lucide-react";
import clsx from "clsx";

interface JobPostRowProps {
    jobPost: JobPost;
    onView?: (id: string) => void;
    onEdit?: (id: string) => void;
    onArchive?: (id: string) => void;
    className?: string;
}

export const JobPostRow: React.FC<JobPostRowProps> = ({
    jobPost,
    onView,
    onEdit,
    onArchive,
    className,
}) => {
    const navigate = useNavigate();
    const isExpiring = isExpiringSoon(jobPost.expiryAt);
    const jobId = jobPost.id;

    const handleRowClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking on action buttons
        const target = e.target as HTMLElement;
        if (target.closest("button")) {
            return;
        }
        navigate(ROUTES.JOB_POST_DETAIL.replace(":id", jobId));
    };

    return (
        <tr
            onClick={handleRowClick}
            className={clsx(
                "border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer",
                className
            )}
        >
            {/* Job Title & Status */}
            <td className="px-6 py-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">{jobPost.title}</h3>
                        {jobPost.status && <JobStatusBadge status={jobPost.status} />}
                    </div>
                    <span className="text-xs text-gray-500">
                        {jobPost.locationCity}
                        {jobPost.isFresher && " • Fresher friendly"}
                    </span>

                    {/* Skills - Under Job Title */}
                    {jobPost.skillIds && jobPost.skillIds.length > 0 && (
                        <div className="mt-1">
                            <SkillsList
                                skillIds={jobPost.skillIds}
                                maxDisplay={4}
                                size="sm"
                                showCount={true}
                            />
                        </div>
                    )}
                </div>
            </td>

            {/* Employment Type */}
            <td className="px-6 py-4">
                {jobPost.employmentType ? (
                    <EmploymentTypeChip type={jobPost.employmentType} />
                ) : (
                    <span className="text-sm text-gray-500">N/A</span>
                )}
            </td>

            {/* Salary */}
            <td className="px-6 py-4">
                <SalaryBadge
                    min={jobPost.salaryMin}
                    max={jobPost.salaryMax}
                    type={jobPost.salaryType}
                    note={jobPost.salaryNote}
                />
            </td>

            {/* ⚠️ REMOVE THIS IF IT EXISTS - No separate Skills column */}
            {/* <td className="px-6 py-4">
                <SkillsList
                    skillIds={jobPost.skillIds}
                    maxDisplay={3}
                    size="sm"
                    showCount={true}
                />
            </td> */}

            {/* Applications Count */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                        {jobPost.applicationsCount || 0}
                    </span>
                    <span className="text-xs text-gray-500">applications</span>
                </div>
            </td>

            {/* Expiry Date */}
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                    <span
                        className={clsx(
                            "text-xs font-medium",
                            isExpiring ? "text-red-600" : "text-gray-600"
                        )}
                    >
                        {formatExpiryDate(jobPost.expiryAt)}
                    </span>
                    {isExpiring && (
                        <span className="text-xs text-red-500 font-semibold">⚠️ Urgent</span>
                    )}
                </div>
            </td>

            {/* Kafka Sync Status */}
            <td className="px-6 py-4">
                <KafkaSyncIndicator
                    status={jobPost.syncStatus || SYNC_STATUS.SYNCED}
                    showLabel={false}
                />
            </td>

            {/* Actions */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onView?.(jobId)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                        View
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit?.(jobId)}
                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                    >
                        Edit
                    </Button>
                    {jobPost.status !== JOB_STATUS.ARCHIVED && onArchive && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onArchive(jobId)}
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            title="Archive job post"
                        >
                            <Archive className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
};
