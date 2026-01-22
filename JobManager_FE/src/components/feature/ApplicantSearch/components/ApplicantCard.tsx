import React from "react";
import { Badge, Card, Button } from "@/components/ui";
import { EMPLOYMENT_TYPE_LABELS, EDUCATION_DEGREE_LABELS } from "@/utils/constants";
import {
    User,
    GraduationCap,
    Clock,
    // TODO: Uncomment when JA adds salary support
    // CircleDollarSign,
    MapPin,
    Star,
    AlertCircle,
} from "lucide-react";
import type { Applicant, EducationDegree } from "../types";

interface ApplicantCardProps {
    applicant: Applicant;
    onClick: () => void;
}

export const ApplicantCard: React.FC<ApplicantCardProps> = ({ applicant, onClick }) => {
    const isFavorite = applicant.companyStatus === "FAVORITE";
    const isWarning = applicant.companyStatus === "WARNING";

    // TODO: Salary display - uncomment when JA adds salary support
    // const formatSalary = (salary?: number): string => {
    //   if (!salary) return "Not specified";
    //   return `$${salary.toLocaleString()}`;
    // };

    return (
        <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow touch-manipulation">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 flex items-center gap-3 w-full sm:w-auto">
                    {applicant.avatarUrl ? (
                        <img
                            src={applicant.avatarUrl}
                            alt={applicant.fullName}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                        </div>
                    )}
                    {/* Mobile: Name next to avatar */}
                    <div className="sm:hidden flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                                {applicant.fullName}
                            </h3>
                            {isFavorite && (
                                <Star
                                    className="w-4 h-4 text-yellow-500 flex-shrink-0"
                                    fill="currentColor"
                                />
                            )}
                            {isWarning && (
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{applicant.email}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 w-full">
                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-2">
                        {applicant.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill.id} variant="info" className="text-xs">
                                {skill.name}
                            </Badge>
                        ))}
                        {applicant.skills.length > 3 && (
                            <Badge variant="neutral" className="text-xs">
                                +{applicant.skills.length - 3}
                            </Badge>
                        )}
                    </div>

                    {/* Name & Status Icons - Desktop only */}
                    <div className="hidden sm:flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {applicant.fullName}
                        </h3>
                        {isFavorite && (
                            <Star
                                className="w-5 h-5 text-yellow-500 flex-shrink-0"
                                fill="currentColor"
                            />
                        )}
                        {isWarning && (
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                    </div>
                    <p className="hidden sm:block text-sm text-gray-500 truncate">
                        {applicant.email}
                    </p>

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-gray-600">
                        {applicant.education && applicant.education.length > 0 && (
                            <span className="flex items-center gap-1">
                                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="truncate max-w-[100px] sm:max-w-none">
                                    {applicant.education[0].degree &&
                                        EDUCATION_DEGREE_LABELS[
                                            applicant.education[0].degree as EducationDegree
                                        ]}
                                </span>
                            </span>
                        )}
                        {applicant.employmentTypes.length > 0 && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="truncate max-w-[80px] sm:max-w-none">
                                    {applicant.employmentTypes
                                        .map((t) => EMPLOYMENT_TYPE_LABELS[t])
                                        .join(", ")}
                                </span>
                            </span>
                        )}
                        {/* TODO: Salary display - uncomment when JA adds salary support */}
                        {/* <span className="flex items-center gap-1">
              <CircleDollarSign className="w-4 h-4" />
              {formatSalary(applicant.desiredSalary)}
            </span> */}
                        {applicant.countryCode && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                {applicant.countryCode}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onClick}
                        fullWidth
                        className="sm:w-auto touch-manipulation"
                    >
                        View Details
                    </Button>
                </div>
            </div>
        </Card>
    );
};
