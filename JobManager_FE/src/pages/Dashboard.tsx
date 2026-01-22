import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { KPICard } from "../components/feature/Dashboard/KPICard";
import { JobPostsTable } from "../components/feature/Dashboard/JobPostsTable";
import {
    RecentApplications,
    ApplicationSummary,
} from "../components/feature/Dashboard/RecentApplications";
import { PremiumBanner } from "../components/feature/Dashboard/PremiumBanner";
import { PremiumFeaturesAd } from "../components/feature/Dashboard/PremiumFeaturesAd";
import { DashboardUpgradeCTA } from "../components/feature/Payment";
import { useSubscriptionDetails } from "../components/feature/Payment/hooks/usePaymentFlow";
import { Button } from "../components/ui/Button/Button";
import DashboardLayout from "../layout/DashboardLayout";
import { fetchJobPosts } from "@/services/jobPostService";
import { notificationService } from "@/components/feature/Notification/api/notificationService";
import { JobPost } from "@/types";
import { ROUTES } from "@/utils/constants";

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    // Fetch real subscription status
    const { subscription, isLoading: isLoadingSubscription } = useSubscriptionDetails();

    // Derive premium status from subscription
    const premiumStatus: "FREE" | "PREMIUM" | "EXPIRING" | "EXPIRED" = React.useMemo(() => {
        if (!subscription) return "FREE";
        if (subscription.status === "EXPIRED") return "EXPIRED";
        if (subscription.isExpiringSoon && subscription.isPremium) return "EXPIRING";
        if (subscription.isPremium) return "PREMIUM";
        return "FREE";
    }, [subscription]);

    const daysRemaining = subscription?.daysRemaining || 0;

    // State for real job posts
    const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
    const [allJobPosts, setAllJobPosts] = useState<JobPost[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State for notifications
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

    // Load job posts on mount
    useEffect(() => {
        loadJobPosts();
        loadUnreadNotifications();
    }, []);

    const loadJobPosts = async () => {
        try {
            setIsLoadingJobs(true);
            setError(null);

            // Fetch more data for trend calculation
            const response = await fetchJobPosts({ page: 0, pageSize: 100 });
            setAllJobPosts(response.data);

            // Get top 5 for display - no transformation needed, status is already computed by transformJobPost
            const displayPosts = response.data.slice(0, 5);
            setJobPosts(displayPosts);
        } catch (err) {
            console.error("Error fetching job posts:", err);
            setError("Failed to load job posts");
            setJobPosts([]);
        } finally {
            setIsLoadingJobs(false);
        }
    };

    const loadUnreadNotifications = async () => {
        try {
            setIsLoadingNotifications(true);
            const count = await notificationService.getUnreadCount();
            setUnreadNotifications(count);
        } catch (err) {
            console.error("Error fetching unread notifications:", err);
            setUnreadNotifications(0);
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    // Calculate trends based on historical data
    const calculateTrends = () => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // Current period (last 30 days)
        const currentPeriodJobs = allJobPosts.filter(
            (job) => new Date(job.createdAt) >= thirtyDaysAgo
        );

        // Previous period (30-60 days ago)
        const previousPeriodJobs = allJobPosts.filter((job) => {
            const createdDate = new Date(job.createdAt);
            return createdDate >= sixtyDaysAgo && createdDate < thirtyDaysAgo;
        });

        // Active jobs trend
        const currentActiveJobs = allJobPosts.filter((job) => job.status === "PUBLISHED").length;
        const previousActiveJobs = allJobPosts.filter(
            (job) => job.status === "PUBLISHED" && new Date(job.createdAt) < thirtyDaysAgo
        ).length;

        const activeJobsDiff = currentActiveJobs - previousActiveJobs;
        const activeJobsTrend = activeJobsDiff > 0 ? "up" : activeJobsDiff < 0 ? "down" : "neutral";

        // Applications trend (sum of all applications)
        const currentApplications = currentPeriodJobs.reduce(
            (sum, job) => sum + (job.applicationsCount || 0),
            0
        );
        const previousApplications = previousPeriodJobs.reduce(
            (sum, job) => sum + (job.applicationsCount || 0),
            0
        );

        const applicationsDiff = currentApplications - previousApplications;
        const applicationsPercent =
            previousApplications > 0
                ? Math.round((applicationsDiff / previousApplications) * 100)
                : 0;
        const applicationsTrend =
            applicationsDiff > 0 ? "up" : applicationsDiff < 0 ? "down" : "neutral";

        return {
            activeJobs: {
                trend: activeJobsTrend as "up" | "down" | "neutral",
                value: Math.abs(activeJobsDiff).toString(),
            },
            applications: {
                trend: applicationsTrend as "up" | "down" | "neutral",
                value: `${Math.abs(applicationsPercent)}%`,
            },
        };
    };

    const trends = calculateTrends();

    // Calculate KPIs from real data
    const kpis = {
        activeJobs: allJobPosts.filter((jp) => jp.status === "PUBLISHED").length,
        totalApplications: allJobPosts.reduce((sum, jp) => sum + (jp.applicationsCount || 0), 0),
        // Calculate new applications from the last 24 hours
        newApplications: allJobPosts
            .filter((jp) => {
                const createdDate = new Date(jp.createdAt);
                const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return createdDate >= twentyFourHoursAgo;
            })
            .reduce((sum, jp) => sum + (jp.applicationsCount || 0), 0),
        unreadNotifications: unreadNotifications,
    };

    const applications: ApplicationSummary[] = [
        {
            id: "101",
            applicantName: "Sarah Chen",
            jobTitle: "Senior Frontend Engineer",
            status: "PENDING",
            appliedAt: "2024-12-17T09:00:00Z",
        },
        {
            id: "102",
            applicantName: "Michael Ross",
            jobTitle: "Backend Developer",
            status: "REVIEWING",
            appliedAt: "2024-12-16T14:30:00Z",
        },
        {
            id: "103",
            applicantName: "Jessica Wu",
            jobTitle: "Senior Frontend Engineer",
            status: "PENDING",
            appliedAt: "2024-12-16T11:15:00Z",
        },
        {
            id: "104",
            applicantName: "David Miller",
            jobTitle: "Product Designer",
            status: "ARCHIVED",
            appliedAt: "2024-12-15T16:45:00Z",
        },
    ];

    return (
        <DashboardLayout>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Overview of your hiring pipeline</p>
                </div>
                <Button
                    onClick={() => navigate(ROUTES.JOB_POST_CREATE)}
                    leftIcon={<Plus className="w-4 h-4" />}
                >
                    Create Job Post
                </Button>
            </div>

            {/* Premium Banner */}
            {!isLoadingSubscription && (
                <PremiumBanner
                    status={premiumStatus}
                    daysRemaining={daysRemaining}
                    onUpgrade={() => navigate(`${ROUTES.SUBSCRIPTION}/upgrade`)}
                />
            )}

            {/* Premium Upgrade CTA - Show for non-premium users */}
            {premiumStatus === "FREE" && <DashboardUpgradeCTA variant="full" />}

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Active Jobs"
                    value={kpis.activeJobs}
                    subValue="posts"
                    trend={trends.activeJobs.trend}
                    trendValue={trends.activeJobs.value}
                    onClick={() => navigate(ROUTES.JOB_POSTS)}
                    isLoading={isLoadingJobs}
                />
                <KPICard
                    title="Total Applications"
                    value={kpis.totalApplications}
                    subValue="candidates"
                    trend={trends.applications.trend}
                    trendValue={trends.applications.value}
                    onClick={() => console.log("View Applications")}
                    isLoading={isLoadingJobs}
                />
                <KPICard
                    title="New Applications"
                    value={kpis.newApplications}
                    subValue="last 24h"
                    onClick={() => console.log("View New")}
                    isLoading={isLoadingJobs}
                />
                <KPICard
                    title="Unread Notifications"
                    value={kpis.unreadNotifications}
                    onClick={() => console.log("View Notifications")}
                    isLoading={isLoadingNotifications}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Job Posts (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Job Posts Overview
                            </h2>
                            <button
                                onClick={() => navigate(ROUTES.JOB_POSTS)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                View All Jobs
                            </button>
                        </div>
                        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
                        <JobPostsTable
                            data={jobPosts}
                            onView={(id) => navigate(`/job-posts/${id}`)}
                            onEdit={(id) => navigate(`/job-posts/${id}/edit`)}
                            onArchive={(id) => console.log("Archive", id)}
                            isLoading={isLoadingJobs}
                        />
                    </section>
                </div>

                {/* Right Column: Applications & Notifications (1/3 width) */}
                <div className="space-y-6">
                    {/* Premium Features Ad - Only for non-premium users */}
                    {premiumStatus === "FREE" && <PremiumFeaturesAd />}

                    <RecentApplications
                        applications={applications}
                        onViewCV={(id) => console.log("View CV", id)}
                        onArchive={(id) => console.log("Archive App", id)}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
