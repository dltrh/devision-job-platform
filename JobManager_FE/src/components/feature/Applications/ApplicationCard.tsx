import React from "react";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { Application, APPLICATION_STATUS } from "@/types/application";
import {
    Eye,
    Archive,
    ArchiveRestore,
    Download,
    FileText,
    Clock,
    Mail,
    Phone,
} from "lucide-react";
import clsx from "clsx";

interface ApplicationCardProps {
    application: Application;
    onView: (id: string) => void;
    onArchive: (id: string) => void;
    onRestore: (id: string) => void;
    onDownloadCV: (id: string) => void;
    onViewCoverLetter: (id: string) => void;
}

const getStatusVariant = (
    status: (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS]
): "success" | "warning" | "error" | "info" | "neutral" => {
    switch (status) {
        case APPLICATION_STATUS.PENDING:
            return "info";
        case APPLICATION_STATUS.REVIEWING:
            return "warning";
        case APPLICATION_STATUS.INTERVIEWING:
            return "info";
        case APPLICATION_STATUS.OFFERED:
            return "success";
        case APPLICATION_STATUS.REJECTED:
            return "error";
        case APPLICATION_STATUS.ARCHIVED:
            return "neutral";
        default:
            return "neutral";
    }
};

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
    application,
    onView,
    onArchive,
    onRestore,
    onDownloadCV,
    onViewCoverLetter,
}) => {
    const isArchived = application.status === APPLICATION_STATUS.ARCHIVED;
    const submittedDate = new Date(application.submittedAt);

    return (
        <Card
            className={clsx(
                "p-4 transition-all hover:shadow-md",
                isArchived && "opacity-75 bg-gray-50"
            )}
        >
            <div className="flex flex-col gap-4">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {application.applicantName}
                            </h3>
                            <Badge
                                variant={getStatusVariant(application.status)}
                            >
                                {application.status}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                            <Clock className="w-4 h-4" />
                            <span>
                                Submitted {submittedDate.toLocaleDateString()}{" "}
                                at{" "}
                                {submittedDate.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">
                                    {application.applicantEmail}
                                </span>
                            </div>
                            {application.applicantPhone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span>{application.applicantPhone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Row */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                    <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Eye className="w-4 h-4" />}
                        onClick={() => onView(application.id)}
                    >
                        View Details
                    </Button>

                    {application.cvUrl && (
                        <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<Download className="w-4 h-4" />}
                            onClick={() => onDownloadCV(application.id)}
                        >
                            Download CV
                        </Button>
                    )}

                    {application.coverLetter && (
                        <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<FileText className="w-4 h-4" />}
                            onClick={() => onViewCoverLetter(application.id)}
                        >
                            Cover Letter
                        </Button>
                    )}

                    <div className="ml-auto">
                        {isArchived ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={
                                    <ArchiveRestore className="w-4 h-4" />
                                }
                                onClick={() => onRestore(application.id)}
                            >
                                Restore
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<Archive className="w-4 h-4" />}
                                onClick={() => onArchive(application.id)}
                            >
                                Archive
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};
