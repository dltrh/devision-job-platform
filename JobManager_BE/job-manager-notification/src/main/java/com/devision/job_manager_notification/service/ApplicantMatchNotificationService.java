package com.devision.job_manager_notification.service;

import com.devision.job_manager_notification.dto.response.ApiResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface ApplicantMatchNotificationService {

    ApiResponse<String> notifyCompanyOfApplicantMatch(
            UUID companyId,
            UUID applicantId,
            Map<String, Object> applicantProfile,
            Map<String, Object> matchingCriteria,
            double matchScore
    );

    ApiResponse<List<String>> processApplicantProfileUpdate(
            UUID applicantId,
            Map<String, Object> updatedProfile,
            Map<String, Object> previousProfile
    );

    ApiResponse<String> evaluateApplicantAgainstSearchProfiles(
            UUID applicantId,
            Map<String, Object> applicantProfile
    );

    ApiResponse<Integer> notifyAllMatchingCompanies(
            UUID applicantId,
            Map<String, Object> applicantProfile
    );

    ApiResponse<Map<String, Object>> calculateMatchScore(
            Map<String, Object> applicantProfile,
            Map<String, Object> searchCriteria
    );

    ApiResponse<Boolean> doesApplicantMatchCriteria(
            Map<String, Object> applicantProfile,
            Map<String, Object> searchCriteria
    );

    ApiResponse<String> formatMatchDetails(
            Map<String, Object> applicantProfile,
            Map<String, Object> matchingCriteria,
            double matchScore
    );

    ApiResponse<List<UUID>> findCompaniesWithMatchingSearchProfiles(
            Map<String, Object> applicantProfile
    );

    ApiResponse<Map<String, Object>> extractMatchingFields(
            Map<String, Object> applicantProfile,
            Map<String, Object> searchCriteria
    );

    ApiResponse<String> validateApplicantProfile(Map<String, Object> applicantProfile);

    ApiResponse<String> validateSearchCriteria(Map<String, Object> searchCriteria);
}
