import React, { useState, useMemo } from "react";
import { HeadlessTabs } from "@/components/headless/Tabs/HeadlessTabs";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { ApplicationCard } from "./ApplicationCard";
import { Application, APPLICATION_STATUS } from "@/types/application";
import { AlertTriangle, Database, Users } from "lucide-react";
import clsx from "clsx";

interface ApplicationsViewProps {
    applications: Application[];
    isLoading?: boolean;
    error?: string | null;
    onViewApplication: (id: string) => void;
    onArchiveApplication: (id: string) => void;
    onRestoreApplication: (id: string) => void;
    onDownloadCV: (id: string) => void;
    onViewCoverLetter: (id: string) => void;
}

type TabType = "pending" | "archived";

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
    applications,
    isLoading = false,
    error = null,
    onViewApplication,
    onArchiveApplication,
    onRestoreApplication,
    onDownloadCV,
    onViewCoverLetter,
}) => {
    const [activeTab, setActiveTab] = useState<TabType>("pending");

    // Filter applications by status
    const pendingApplications = useMemo(
        () =>
            applications
                .filter((app) => app.status !== APPLICATION_STATUS.ARCHIVED)
                .sort(
                    (a, b) =>
                        new Date(b.submittedAt).getTime() -
                        new Date(a.submittedAt).getTime()
                ),
        [applications]
    );

    const archivedApplications = useMemo(
        () =>
            applications
                .filter((app) => app.status === APPLICATION_STATUS.ARCHIVED)
                .sort(
                    (a, b) =>
                        new Date(b.submittedAt).getTime() -
                        new Date(a.submittedAt).getTime()
                ),
        [applications]
    );

    const tabs = [
        {
            id: "pending",
            label: "Pending",
            count: pendingApplications.length,
        },
        {
            id: "archived",
            label: "Archived",
            count: archivedApplications.length,
        },
    ];

    const currentApplications =
        activeTab === "pending" ? pendingApplications : archivedApplications;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Error Loading Applications
                </h3>
                <p className="text-gray-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Subsystem Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Applications
                    </h1>
                    <p className="text-gray-600">
                        Review and manage applicants for this job posting
                    </p>
                </div>

                {/* Badge indicating data source - Important for interview discussion */}
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                        Data from Job Applicant Subsystem
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
                <HeadlessTabs
                    tabs={tabs}
                    defaultTab={activeTab}
                    onChange={(tabId) => setActiveTab(tabId as TabType)}
                >
                    {(currentTab, setTab, tabItems) => (
                        <>
                            {/* Tab Navigation */}
                            <div className="border-b border-gray-200">
                                <nav
                                    className="flex space-x-8 px-6"
                                    aria-label="Application tabs"
                                >
                                    {tabItems.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setTab(tab.id)}
                                            className={clsx(
                                                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer",
                                                currentTab === tab.id
                                                    ? "border-blue-500 text-blue-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            )}
                                        >
                                            {tab.label}
                                            {tab.count !== undefined && (
                                                <span
                                                    className={clsx(
                                                        "ml-2 py-0.5 px-2 rounded-full text-xs",
                                                        currentTab === tab.id
                                                            ? "bg-blue-100 text-blue-600"
                                                            : "bg-gray-100 text-gray-600"
                                                    )}
                                                >
                                                    {tab.count}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {currentApplications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <Users className="w-12 h-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            No Applications Yet
                                        </h3>
                                        <p className="text-gray-600">
                                            {activeTab === "pending"
                                                ? "There are no pending applications for this job post."
                                                : "There are no archived applications."}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Results count */}
                                        <p className="text-sm text-gray-600">
                                            Showing {currentApplications.length}{" "}
                                            {activeTab === "pending"
                                                ? "pending"
                                                : "archived"}{" "}
                                            {currentApplications.length === 1
                                                ? "application"
                                                : "applications"}
                                        </p>

                                        {/* Application cards */}
                                        {currentApplications.map(
                                            (application) => (
                                                <ApplicationCard
                                                    key={application.id}
                                                    application={application}
                                                    onView={onViewApplication}
                                                    onArchive={
                                                        onArchiveApplication
                                                    }
                                                    onRestore={
                                                        onRestoreApplication
                                                    }
                                                    onDownloadCV={onDownloadCV}
                                                    onViewCoverLetter={
                                                        onViewCoverLetter
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </HeadlessTabs>
            </div>
        </div>
    );
};
