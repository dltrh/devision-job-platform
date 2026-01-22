import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { JobPost } from "@/types";
import { ROUTES, EMPLOYMENT_TYPE_LABELS } from "@/utils/constants";
import { fetchJobPostById } from "@/services/jobPostService";
import { formatSalary } from "@/utils/jobPostHelpers";
import { Button, Spinner, Card, Badge } from "@/components/ui";
import { JobStatusBadge } from "@/components/feature/JobPosts";
import { fetchApplicationCounts } from "@/services/applicationService";

const JobPostDetailPage: React.FC = () => {
	const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [jobPost, setJobPost] = useState<JobPost | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Application counts state
    const [applicationsStats, setApplicationsStats] = useState({
        pending: 0,
        archived: 0,
    });

    // Combined useEffect - load job post and application counts
    useEffect(() => {
        if (!id) {
            setError("Job post ID not found");
            setLoading(false);
            return;
        }

        loadJobPost();
        loadApplicationCounts();
    }, [id]);

    const loadJobPost = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchJobPostById(id!);
            setJobPost(data);
        } catch (err) {
            console.error("Error loading job post:", err);
            setError("Failed to load job post details");
        } finally {
            setLoading(false);
        }
    };

    const loadApplicationCounts = async () => {
        if (!id) return;
        
        try {
            const counts = await fetchApplicationCounts(id);
            setApplicationsStats({
                pending: counts.pending,
                archived: counts.archived,
            });
        } catch (err) {
            console.error("Error loading application counts:", err);
            // Silently fail - counts will remain at 0
        }
    };

    const handleEdit = () => {
        navigate(ROUTES.JOB_POST_EDIT.replace(":id", id!));
    };

    const handleViewApplications = () => {
        navigate(ROUTES.JOB_POST_APPLICATIONS.replace(":jobPostId", id!));
    };

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<Spinner size="lg" />
			</div>
		);
	}

	if (error || !jobPost) {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<Card className="text-center p-8">
					<p className="text-red-600 mb-4">
						{error || "Job post not found"}
					</p>
					<Button onClick={() => navigate(ROUTES.JOB_POSTS)}>
						Back to Job Posts
					</Button>
				</Card>
			</div>
		);
	}

	const salaryDisplay = formatSalary(
		jobPost.salaryMin,
		jobPost.salaryMax,
		jobPost.salaryType,
		jobPost.salaryNote
	);

	return (
		<div className="max-w-7xl mx-auto p-6">
			{/* Back Button */}
			<div className="mb-4">
				<Button
					variant="ghost"
					onClick={() => navigate(ROUTES.JOB_POSTS)}
					className="text-gray-600 hover:text-gray-900"
				>
					← Back to Job Posts
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Main Content - Left Side (2/3) */}
				<div className="lg:col-span-2 space-y-6">
					{/* Header Card */}
					<Card>
						<div className="flex items-start justify-between mb-4">
							<div className="flex-1">
								<h1 className="text-3xl font-bold text-gray-900 mb-3">
									{jobPost.title}
								</h1>
								<div className="flex items-center gap-2">
									<JobStatusBadge status={jobPost.status!} />
									{jobPost.isFresher && (
										<Badge variant="info">
											Fresher Friendly
										</Badge>
									)}
								</div>
							</div>
							<Button onClick={handleEdit} variant="primary">
								Edit Job Post
							</Button>
						</div>
					</Card>

					{/* Job Details Card */}
					<Card>
						<h2 className="text-xl font-semibold text-gray-900 mb-4">
							Job Description
						</h2>
						<div className="prose max-w-none">
							<p className="text-gray-700 whitespace-pre-wrap">
								{jobPost.description}
							</p>
						</div>
					</Card>

					{/* Job Information Card */}
					<Card>
						<h2 className="text-xl font-semibold text-gray-900 mb-4">
							Job Information
						</h2>
						<div className="space-y-4">
							{/* Employment Type */}
							{jobPost.employmentType && (
								<div className="flex items-start">
									<div className="w-40 font-medium text-gray-600">
										Employment Type:
									</div>
									<div className="flex-1">
										<Badge variant="neutral">
											{EMPLOYMENT_TYPE_LABELS[
												jobPost.employmentType
											] || jobPost.employmentType}
										</Badge>
									</div>
								</div>
							)}

							{/* Salary */}
							<div className="flex items-start">
								<div className="w-40 font-medium text-gray-600">
									Salary:
								</div>
								<div className="flex-1">
									<span className="text-gray-900 font-semibold">
										{salaryDisplay}
									</span>
								</div>
							</div>

							{/* Location */}
							<div className="flex items-start">
								<div className="w-40 font-medium text-gray-600">
									Location:
								</div>
								<div className="flex-1">
									<span className="text-gray-900">
										{jobPost.locationCity}
										{jobPost.countryName &&
											`, ${jobPost.countryName}`}
									</span>
								</div>
							</div>

							{/* Expiry Date */}
							<div className="flex items-start">
								<div className="w-40 font-medium text-gray-600">
									Expires On:
								</div>
								<div className="flex-1">
									<span className="text-gray-900">
										{new Date(
											jobPost.expiryAt
										).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</span>
								</div>
							</div>

							{/* Posted Date */}
							{jobPost.postedAt && (
								<div className="flex items-start">
									<div className="w-40 font-medium text-gray-600">
										Posted On:
									</div>
									<div className="flex-1">
										<span className="text-gray-900">
											{new Date(
												jobPost.postedAt
											).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</span>
									</div>
								</div>
							)}
						</div>
					</Card>

					{/* Skills Card */}
					{jobPost.skillIds && jobPost.skillIds.length > 0 && (
						<Card>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Required Skills
							</h2>
							<div className="flex flex-wrap gap-2">
								{jobPost.skillIds.map((skillId, index) => (
									<Badge
										key={skillId}
										variant="info"
										className="px-3 py-1.5 text-sm"
									>
										{/* TODO: Map skill IDs to skill names when skill service is available */}
										Skill #{index + 1}
									</Badge>
								))}
							</div>
						</Card>
					)}
				</div>

				{/* Right Panel - Applications Summary (1/3) */}
				<div className="lg:col-span-1">
					<Card className="sticky top-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">
							Applications Summary
						</h2>

						<div className="space-y-4">
							{/* Pending Applications */}
							<div className="bg-blue-50 rounded-lg p-4">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium text-blue-900">
										Pending
									</span>
									<Badge
										variant="info"
										className="text-lg font-bold"
									>
										{applicationsStats.pending}
									</Badge>
								</div>
								<p className="text-xs text-blue-700">
									Applications awaiting review
								</p>
							</div>

							{/* Archived Applications */}
							<div className="bg-gray-50 rounded-lg p-4">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium text-gray-900">
										Archived
									</span>
									<Badge
										variant="neutral"
										className="text-lg font-bold"
									>
										{applicationsStats.archived}
									</Badge>
								</div>
								<p className="text-xs text-gray-700">
									Applications reviewed and archived
								</p>
							</div>

							{/* View Applications Button */}
							<Button
								variant="primary"
								onClick={handleViewApplications}
								className="w-full mt-4"
							>
								View All Applications
							</Button>
						</div>

						{/* Additional Information */}
						<div className="mt-6 pt-6 border-t border-gray-200">
							<h3 className="text-sm font-semibold text-gray-900 mb-3">
								Post Information
							</h3>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-600">
										Total Views:
									</span>
									<span className="font-medium text-gray-900">
										{/* TODO: Add views tracking */}
										N/A
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">
										Created:
									</span>
									<span className="font-medium text-gray-900">
										{new Date(
											jobPost.createdAt
										).toLocaleDateString()}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">
										Last Updated:
									</span>
									<span className="font-medium text-gray-900">
										{new Date(
											jobPost.updatedAt
										).toLocaleDateString()}
									</span>
								</div>
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default JobPostDetailPage;
