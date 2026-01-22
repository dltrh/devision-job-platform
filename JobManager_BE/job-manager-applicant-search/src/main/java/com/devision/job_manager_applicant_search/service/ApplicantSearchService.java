package com.devision.job_manager_applicant_search.service;

import com.devision.job_manager_applicant_search.dto.internal.response.ApplicantResponse;
import com.devision.job_manager_applicant_search.dto.internal.request.ApplicantSearchRequest;

import java.util.List;

public interface ApplicantSearchService {

    /**
     * Search for applicants using the given filter criteria.
     * Forwards the request to JA service's search endpoint.
     * 
     * @param request Search filter parameters
     * @return Paginated response of matching applicants
     */
    ApplicantSearchResult searchApplicants(ApplicantSearchRequest request);

    /**
     * Get all available skills for filter options.
     * 
     * @return List of skills from JA service
     */
    List<ApplicantResponse.SkillDto> getSkills();

    /**
     * Search skills by name.
     * 
     * @param query Search query
     * @return List of matching skills
     */
    List<ApplicantResponse.SkillDto> searchSkills(String query);

    /**
     * Paginated search result wrapper.
     */
    record ApplicantSearchResult(
            List<ApplicantResponse> content,
            int page,
            int size,
            long totalElements,
            int totalPages,
            boolean first,
            boolean last
    ) {}
}
