import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { HeadlessTable } from "../../headless/Table/Table";
import { TableColumn } from "../../headless/Table/useTable";
import { Button } from "../../ui/Button/Button";
import { Card } from "../../ui/Card/Card";
import { Skeleton } from "../../ui/Skeleton/Skeleton";
import { Tooltip } from "../../ui/Tooltip/Tooltip";
import { JobPost } from "@/types";
import { SYNC_STATUS, ROUTES } from "@/utils/constants";
import { JobStatusBadge } from "../JobPosts/JobStatusBadge";
// Add this import at the top with other imports
import { formatSalary } from "@/utils/jobPostHelpers";

interface JobPostsTableProps {
    data: JobPost[];
    onView: (id: string) => void;
    onEdit: (id: string) => void;
    onArchive: (id: string) => void;
    isLoading?: boolean;
}

export const JobPostsTable: React.FC<JobPostsTableProps> = ({
    data,
    onView,
    onEdit,
    onArchive,
    isLoading = false,
}) => {
    const navigate = useNavigate();

    const handleRowClick = (id: string, e: React.MouseEvent) => {
        // Don't navigate if clicking on action buttons
        const target = e.target as HTMLElement;
        if (target.closest("button")) {
            return;
        }
        navigate(ROUTES.JOB_POST_DETAIL.replace(":id", id));
    };

    const columns: TableColumn<JobPost>[] = [
        {
            key: "title",
            header: "Job Title",
            render: (item) => (
                <div>
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-500">
                        Updated {new Date(item.updatedAt).toLocaleDateString()}
                    </div>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (item) => (
                <div className="flex flex-col gap-1">
                    {item.status && <JobStatusBadge status={item.status} />}
                    {item.syncStatus && item.syncStatus !== SYNC_STATUS.SYNCED && (
                        <span className="text-[10px] text-gray-400">
                            {item.syncStatus === SYNC_STATUS.PENDING
                                ? "Syncing..."
                                : item.syncStatus === SYNC_STATUS.UPDATING
                                  ? "Updating..."
                                  : "Sync Failed"}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "employmentType",
            header: "Type",
            render: (item) => (
                <Tooltip content="Employment contract type">
                    <span className="cursor-help border-b border-dotted border-gray-400">
                        {item.employmentType || "N/A"}
                    </span>
                </Tooltip>
            ),
        },
        {
            key: "salaryMin",
            header: "Salary",
            render: (item) => {
                let salaryDisplay = "Negotiable";
                if (item.salaryType === "NEGOTIABLE") {
                    salaryDisplay = "Negotiable";
                } else {
                    salaryDisplay = formatSalary(
                        item.salaryMin,
                        item.salaryMax,
                        item.salaryType,
                        null // Don't pass note to formatting
                    );
                }

                const tooltipContent = item.salaryNote
                    ? `${item.salaryNote}`
                    : "No note for salary";

                return (
                    <div className="flex flex-col">
                        <Tooltip content={tooltipContent}>
                            <span className="cursor-help border-b border-dotted border-gray-400">
                                {salaryDisplay}
                            </span>
                        </Tooltip>
                        {item.salaryNote && (
                            <span className="text-xs text-gray-500 mt-0.5">{item.salaryNote}</span>
                        )}
                    </div>
                );
            },
        },
        {
            key: "applicationsCount",
            header: "Applications",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">
                        {item.applicationsCount || 0}
                    </span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(ROUTES.JOB_POST_APPLICATIONS.replace(":jobPostId", item.id));
                        }}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                        View →
                    </button>
                </div>
            ),
        },
        {
            key: "expiryAt",
            header: "Expires",
            render: (item) => new Date(item.expiryAt).toLocaleDateString(),
        },
        {
            key: "id", // Using ID for actions column
            header: "Actions",
            render: (item) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => onView(item.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        View
                    </button>
                    <button
                        onClick={() => onEdit(item.id)}
                        className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onArchive(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                        Archive
                    </button>
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <Card padding="none" className="overflow-hidden">
                <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex space-x-4">
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    if (data.length === 0) {
        return (
            <Card className="text-center py-12">
                <p className="text-gray-500 mb-4">No job posts found.</p>
                <Button
                    onClick={() => navigate(ROUTES.JOB_POST_CREATE)}
                    leftIcon={<Plus className="w-4 h-4" />}
                >
                    Create your first job post
                </Button>
            </Card>
        );
    }

    return (
        <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
                <HeadlessTable
                    data={data}
                    columns={columns}
                    className="min-w-full divide-y divide-gray-200"
                    renderHeader={(cols) => (
                        <thead className="bg-gray-50">
                            <tr>
                                {cols.map((col) => (
                                    <th
                                        key={String(col.key)}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                    >
                                        {col.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    )}
                    renderRow={(item, cols) => (
                        <tr
                            key={item.id}
                            onClick={(e) => handleRowClick(item.id, e)}
                            className="bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            {cols.map((col) => (
                                <td
                                    key={`${item.id}-${String(col.key)}`}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                >
                                    {col.render ? col.render(item) : (item as any)[col.key]}
                                </td>
                            ))}
                        </tr>
                    )}
                />
            </div>
        </Card>
    );
};
