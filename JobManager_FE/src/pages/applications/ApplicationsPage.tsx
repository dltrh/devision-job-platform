import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import { Button, Spinner, Card, Badge } from "@/components/ui";
import { HeadlessTabs, TabItem, useConfirmDialog } from "@/components/headless";
import { ConfirmDialog } from "@/components/ui";
import {
    fetchApplications,
    fetchApplicationCounts,
    archiveApplication,
    unarchiveApplication,
    openApplicationFileInNewTab,
    ApplicationResponse,
} from "@/services/applicationService";
import { Archive, ArchiveRestore, FileText, Download } from "lucide-react";
import clsx from "clsx";

const ApplicationsPage: React.FC = () => {
    const { jobPostId } = useParams<{ jobPostId: string }>();
    const navigate = useNavigate();

    // State
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState<ApplicationResponse[]>([]);
    const [activeTab, setActiveTab] = useState<"pending" | "archived">("pending");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [error, setError] = useState<string | null>(null);
    
    // Counts for tabs
    const [pendingCount, setPendingCount] = useState(0);
    const [archivedCount, setArchivedCount] = useState(0);

    // Confirm dialogs
    const archiveDialog = useConfirmDialog();
    const unarchiveDialog = useConfirmDialog();

    // Tab configuration
    const tabs: TabItem[] = [
        {
            id: "pending",
            label: "Pending",
            count: pendingCount,
        },
        {
            id: "archived",
            label: "Archived",
            count: archivedCount,
        },
    ];

    // Load applications and counts
    useEffect(() => {
        if (!jobPostId) {
            setError("Job post ID not found");
            setLoading(false);
            return;
        }

        loadApplications();
        loadCounts();
    }, [jobPostId, activeTab, currentPage]);

    const loadApplications = async () => {
        if (!jobPostId) return;

        try {
            setLoading(true);
            setError(null);

            const archived = activeTab === "archived";
            const response = await fetchApplications({
                jobPostId,
                page: currentPage,
                size: 20,
                archived,
            });

            setApplications(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (err) {
            console.error("Error loading applications:", err);
            setError("Failed to load applications. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const loadCounts = async () => {
        if (!jobPostId) return;

        try {
            const counts = await fetchApplicationCounts(jobPostId);
            setPendingCount(counts.pending);
            setArchivedCount(counts.archived);
        } catch (err) {
            console.error("Error loading counts:", err);
        }
    };

    const handleArchive = (applicationId: string) => {
        archiveDialog.open({
            title: "Archive Application",
            message:
                "Are you sure you want to archive this application? You can unarchive it later if needed.",
            variant: "warning",
            confirmText: "Archive",
            cancelText: "Cancel",
            onConfirm: async () => {
                try {
                    await archiveApplication(applicationId, jobPostId!);
                    await loadApplications();
                    await loadCounts();
                } catch (err) {
                    console.error("Error archiving application:", err);
                    setError("Failed to archive application. Please try again.");
                }
            },
        });
    };

    const handleUnarchive = (applicationId: string) => {
        unarchiveDialog.open({
            title: "Unarchive Application",
            message: "Move this application back to pending?",
            variant: "info",
            confirmText: "Unarchive",
            cancelText: "Cancel",
            onConfirm: async () => {
                try {
                    await unarchiveApplication(applicationId);
                    await loadApplications();
                    await loadCounts();
                } catch (err) {
                    console.error("Error unarchiving application:", err);
                    setError("Failed to unarchive application. Please try again.");
                }
            },
        });
    };

    const handleViewResume = async (applicationId: string) => {
        try {
            await openApplicationFileInNewTab(applicationId, "RESUME");
        } catch (err) {
            console.error("Error viewing resume:", err);
            setError("Failed to load resume. Please try again.");
        }
    };

    const handleViewCoverLetter = async (applicationId: string) => {
        try {
            await openApplicationFileInNewTab(applicationId, "COVER_LETTER");
        } catch (err) {
            console.error("Error viewing cover letter:", err);
            setError("Failed to load cover letter. Please try again.");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading && applications.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(ROUTES.JOB_POST_DETAIL.replace(":id", jobPostId!))}
                        className="mb-4 text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Job Post
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Review and manage job applications
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Tabs */}
                <Card className="mb-6">
                    <HeadlessTabs
                        tabs={tabs}
                        defaultTab={activeTab}
                        onChange={(tabId) => {
                            setActiveTab(tabId as "pending" | "archived");
                            setCurrentPage(0); // Reset to first page on tab change
                        }}
                    >
                        {(currentTab, setTab, tabItems) => (
                            <div className="border-b border-gray-200">
                                <nav className="flex space-x-8" aria-label="Tabs">
                                    {tabItems.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setTab(tab.id)}
                                            className={clsx(
                                                "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                                                currentTab === tab.id
                                                    ? "border-blue-500 text-blue-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                            )}
                                        >
                                            {tab.label}
                                            {tab.count !== undefined && (
                                                <Badge
                                                    variant={currentTab === tab.id ? "info" : "neutral"}
                                                    className="ml-2"
                                                >
                                                    {tab.count}
                                                </Badge>
                                            )}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        )}
                    </HeadlessTabs>
                </Card>

                {/* Applications List */}
                {applications.length === 0 ? (
                    <Card className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                            {activeTab === "pending"
                                ? "No pending applications"
                                : "No archived applications"}
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {applications.map((application) => (
                            <Card key={application.id} className="hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    {/* Left side - Application info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Applicant ID: {application.userId}
                                            </h3>
                                            <Badge variant="neutral">{application.status}</Badge>
                                        </div>

                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>
                                                <span className="font-medium">Applied:</span>{" "}
                                                {formatDate(application.appliedAt)}
                                            </p>
                                            {application.userNotes && (
                                                <p>
                                                    <span className="font-medium">Notes:</span>{" "}
                                                    {application.userNotes}
                                                </p>
                                            )}
                                        </div>

                                        {/* File buttons */}
                                        <div className="flex gap-2 mt-4">
                                            {application.resumeUrl && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleViewResume(application.id)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    View Resume
                                                </Button>
                                            )}
                                            {application.coverLetterUrl && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleViewCoverLetter(application.id)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    View Cover Letter
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right side - Actions */}
                                    <div className="ml-4">
                                        {activeTab === "pending" ? (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleArchive(application.id)}
                                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                                            >
                                                <Archive className="w-4 h-4" />
                                                Archive
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleUnarchive(application.id)}
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                                            >
                                                <ArchiveRestore className="w-4 h-4" />
                                                Unarchive
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {applications.length} of {totalElements} applications
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => prev - 1)}
                                disabled={currentPage === 0 || loading}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-gray-600 px-3">
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                                disabled={currentPage >= totalPages - 1 || loading}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Dialogs */}
            <ConfirmDialog dialog={archiveDialog} />
            <ConfirmDialog dialog={unarchiveDialog} />
        </div>
    );
};

export default ApplicationsPage;