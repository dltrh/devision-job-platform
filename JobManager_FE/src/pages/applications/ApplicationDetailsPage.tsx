import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/layout/DashboardLayout";
import { Button } from "@/components/ui/Button/Button";
import { Badge } from "@/components/ui/Badge/Badge";
import { Card } from "@/components/ui/Card/Card";
import { Application, APPLICATION_STATUS } from "@/types/application";
import { JobPost } from "@/types";
import {
    ArrowLeft,
    Mail,
    Phone,
    Clock,
    Download,
    Archive,
    User,
    FileText,
    Database,
} from "lucide-react";
import clsx from "clsx";

// TODO: Replace with actual API call
const MOCK_JOB_POSTS: JobPost[] = [
    {
        id: "job-1",
        title: "Senior Frontend Developer",
        description: "We are looking for an experienced Frontend Developer...",
        isPublished: true,
        isPrivate: false,
        isFresher: false,
        companyId: "company-1",
        countryCode: "US",
        locationCity: "San Francisco, CA",
        salaryMin: 120000,
        salaryMax: 180000,
        salaryType: "RANGE",
        salaryNote: "Competitive salary based on experience",
        expiryAt: "2025-03-30T00:00:00Z",
        postedAt: "2025-12-01T10:00:00Z",
        createdAt: "2025-12-01T00:00:00Z",
        updatedAt: "2025-12-15T00:00:00Z",
        skillIds: ["skill-1", "skill-2", "skill-3"],
        // Computed/frontend fields
        status: "PUBLISHED",
        employmentType: "FULL_TIME",
        location: "San Francisco, CA",
        applicationsCount: 5,
    },
];

const MOCK_APPLICATIONS: Application[] = [
    {
        id: "app-1",
        applicantId: "applicant-1",
        applicantName: "Alice Johnson",
        applicantEmail: "alice.johnson@email.com",
        applicantPhone: "+1 (555) 123-4567",
        jobPostId: "job-1",
        jobTitle: "Senior Frontend Developer",
        status: "PENDING",
        submittedAt: "2025-12-30T10:30:00Z",
        cvUrl: "https://example.com/cv/alice-johnson.pdf",
        coverLetter: `Dear Hiring Manager,

I am writing to express my strong interest in the Senior Frontend Developer position at your company. With over 5 years of experience in building scalable web applications using React, TypeScript, and modern frontend technologies, I am confident in my ability to contribute effectively to your team.

Throughout my career, I have:
- Led the development of multiple production applications serving thousands of users
- Implemented complex state management solutions using Redux and Context API
- Collaborated with cross-functional teams to deliver high-quality features on time
- Mentored junior developers and conducted code reviews

I am particularly excited about this opportunity because of your company's commitment to innovation and user-centric design. I believe my technical expertise combined with my passion for creating intuitive user experiences makes me an ideal fit for this role.

I would welcome the opportunity to discuss how my skills and experience align with your needs. Thank you for considering my application.

Best regards,
Alice Johnson`,
        notes: "Strong candidate with excellent React experience",
        sourceSubsystem: "job-applicant",
        createdAt: "2025-12-30T10:30:00Z",
        updatedAt: "2025-12-30T10:30:00Z",
    },
];

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

const ApplicationDetailsPage: React.FC = () => {
    const { jobPostId, applicationId } = useParams<{
        jobPostId: string;
        applicationId: string;
    }>();
    const navigate = useNavigate();

    // TODO: Fetch application details from API
    const application = MOCK_APPLICATIONS.find(
        (app) => app.id === applicationId
    );

    // TODO: Fetch job post details from API
    const jobPost = MOCK_JOB_POSTS.find((job) => job.id === jobPostId);

    const handleArchive = () => {
        console.log("Archive application:", applicationId);
        // TODO: Call API to archive
    };

    const handleDownloadCV = () => {
        if (application?.cvUrl) {
            window.open(application.cvUrl, "_blank");
        }
    };

    if (!application) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Application Not Found
                    </h2>
                    <p className="text-gray-600 mb-4">
                        The application you're looking for doesn't exist.
                    </p>
                    <Button
                        onClick={() =>
                            navigate(`/job-posts/${jobPostId}/applications`)
                        }
                    >
                        Back to Applications
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const submittedDate = new Date(application.submittedAt);
    const isArchived = application.status === APPLICATION_STATUS.ARCHIVED;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                        onClick={() =>
                            navigate(`/job-posts/${jobPostId}/applications`)
                        }
                    >
                        Back to Applications
                    </Button>

                    {/* Subsystem Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                        <Database className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-900">
                            Job Applicant Subsystem
                        </span>
                    </div>
                </div>

                {/* Main Content */}
                <Card
                    className={clsx(
                        "p-6",
                        isArchived && "opacity-75 bg-gray-50"
                    )}
                >
                    {/* Applicant Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <User className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {application.applicantName}
                                </h1>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail className="w-4 h-4" />
                                        <a
                                            href={`mailto:${application.applicantEmail}`}
                                            className="hover:text-blue-600"
                                        >
                                            {application.applicantEmail}
                                        </a>
                                    </div>
                                    {application.applicantPhone && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Phone className="w-4 h-4" />
                                            <a
                                                href={`tel:${application.applicantPhone}`}
                                                className="hover:text-blue-600"
                                            >
                                                {application.applicantPhone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Badge variant={getStatusVariant(application.status)}>
                            {application.status}
                        </Badge>
                    </div>

                    {/* Job & Submission Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <div className="text-sm text-gray-500 mb-1">
                                Applied For
                            </div>
                            <div className="font-medium text-gray-900">
                                {jobPost?.title || application.jobTitle}
                            </div>
                            {jobPost && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {jobPost.employmentType} •{" "}
                                    {jobPost.location}
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Submitted
                            </div>
                            <div className="font-medium text-gray-900">
                                {submittedDate.toLocaleDateString()} at{" "}
                                {submittedDate.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-gray-200">
                        {application.cvUrl && (
                            <Button
                                variant="primary"
                                leftIcon={<Download className="w-4 h-4" />}
                                onClick={handleDownloadCV}
                            >
                                Download CV
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            leftIcon={<Archive className="w-4 h-4" />}
                            onClick={handleArchive}
                        >
                            {isArchived ? "Restore" : "Archive"}
                        </Button>
                    </div>

                    {/* Cover Letter */}
                    {application.coverLetter && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="w-5 h-5 text-gray-700" />
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Cover Letter
                                </h2>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {application.coverLetter}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {application.notes && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">
                                Internal Notes
                            </h2>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-gray-700">
                                    {application.notes}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Additional Info Section */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            <div className="flex items-center justify-between">
                                <span>Application ID: {application.id}</span>
                                <span>
                                    Applicant ID: {application.applicantId}
                                </span>
                            </div>
                            <div className="mt-2">
                                Last Updated:{" "}
                                {new Date(
                                    application.updatedAt
                                ).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default ApplicationDetailsPage;
