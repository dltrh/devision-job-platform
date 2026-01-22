import React from "react";
import { Card, CardHeader } from "../../ui/Card/Card";
import { Badge, BadgeVariant } from "../../ui/Badge/Badge";
import { Skeleton } from "../../ui/Skeleton/Skeleton";

export interface ApplicationSummary {
    id: string;
    applicantName: string;
    jobTitle: string;
    status:
        | "PENDING"
        | "REVIEWING"
        | "INTERVIEWING"
        | "OFFERED"
        | "REJECTED"
        | "ARCHIVED";
    appliedAt: string;
}

interface RecentApplicationsProps {
    applications: ApplicationSummary[];
    onViewCV: (id: string) => void;
    onArchive: (id: string) => void;
    isLoading?: boolean;
}

export const RecentApplications: React.FC<RecentApplicationsProps> = ({
    applications,
    onViewCV,
    onArchive,
    isLoading = false,
}) => {
    const getStatusVariant = (status: string): BadgeVariant => {
        switch (status) {
            case "PENDING":
                return "info";
            case "REVIEWING":
                return "warning";
            case "INTERVIEWING":
                return "neutral";
            case "OFFERED":
                return "success";
            case "REJECTED":
                return "error";
            case "ARCHIVED":
                return "neutral";
            default:
                return "neutral";
        }
    };

    return (
        <Card className="h-full">
            <CardHeader className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                    Recent Applications
                </h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                    View All
                </button>
            </CardHeader>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <div className="flex-1 space-y-2">
                                <Skeleton width="60%" height={16} />
                                <Skeleton width="40%" height={12} />
                            </div>
                            <Skeleton width={60} height={20} />
                        </div>
                    ))}
                </div>
            ) : applications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No new applications yet.
                </div>
            ) : (
                <div className="flow-root">
                    <ul className="-my-5 divide-y divide-gray-200">
                        {applications.map((app) => (
                            <li key={app.id} className="py-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {app.applicantName}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            Applied for{" "}
                                            <span className="font-medium">
                                                {app.jobTitle}
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {new Date(
                                                app.appliedAt
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <Badge
                                            variant={getStatusVariant(
                                                app.status
                                            )}
                                        >
                                            {app.status}
                                        </Badge>
                                        <div className="flex space-x-3 text-xs">
                                            <button
                                                onClick={() => onViewCV(app.id)}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                View CV
                                            </button>
                                            <button
                                                onClick={() =>
                                                    onArchive(app.id)
                                                }
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                Archive
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    );
};
