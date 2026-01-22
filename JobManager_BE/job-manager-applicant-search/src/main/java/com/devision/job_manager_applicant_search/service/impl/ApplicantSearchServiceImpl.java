package com.devision.job_manager_applicant_search.service.impl;

import com.devision.job_manager_applicant_search.client.ApplicantClient;
import com.devision.job_manager_applicant_search.dto.PageResponse;
import com.devision.job_manager_applicant_search.dto.internal.response.ApplicantResponse;
import com.devision.job_manager_applicant_search.dto.internal.request.ApplicantSearchRequest;
import com.devision.job_manager_applicant_search.service.ApplicantSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ApplicantSearchService.
 * 
 * Delegates search to JA service which now handles:
 * - skills, country, city, education, workExperience, employmentTypes, username
 * - Pagination (page, size)
 * 
 * TODO: Salary filtering - JA does not have salary fields yet.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicantSearchServiceImpl implements ApplicantSearchService {

    private final ApplicantClient applicantClient;

    @Override
    public ApplicantSearchResult searchApplicants(ApplicantSearchRequest request) {
        log.info("Searching applicants with filters: username={}, ftsQuery={}, country={}, city={}, education={}, skills={}",
                request.getUsername(), request.getFtsQuery(), request.getCountryCode(), request.getCity(), 
                request.getEducation(), request.getSkills());

        // Build comma-separated params
        String skillsParam = request.getSkills() != null && !request.getSkills().isEmpty()
                ? String.join(",", request.getSkills())
                : null;
        
        String employmentTypesParam = request.getEmploymentTypes() != null && !request.getEmploymentTypes().isEmpty()
                ? String.join(",", request.getEmploymentTypes())
                : null;

        int page = request.getPage() != null ? request.getPage() : 0;
        int size = request.getPageSize() != null ? request.getPageSize() : 10;

        // Call JA service with all supported filters including FTS query
        PageResponse<ApplicantResponse> jaResponse = applicantClient.searchApplicants(
                skillsParam,
                request.getCountryCode(),
                request.getCity(),
                request.getEducation(),
                request.getWorkExperience(),
                employmentTypesParam,
                request.getUsername(),
                request.getFtsQuery(),
                page,
                size
        );

        // Apply local sorting if needed (JA returns sorted by default)
        List<ApplicantResponse> sortedResults = applySorting(jaResponse.getContent(), request.getSortBy());

        log.info("Returning {} of {} total applicants (page {} of {})",
                sortedResults.size(), jaResponse.getTotalElements(), jaResponse.getPage(), jaResponse.getTotalPages());

        return new ApplicantSearchResult(
                sortedResults,
                jaResponse.getPage(),
                jaResponse.getSize(),
                jaResponse.getTotalElements(),
                jaResponse.getTotalPages(),
                jaResponse.isFirst(),
                jaResponse.isLast()
        );
    }

    @Override
    public List<ApplicantResponse.SkillDto> getSkills() {
        return applicantClient.getAllSkills();
    }

    @Override
    public List<ApplicantResponse.SkillDto> searchSkills(String query) {
        return applicantClient.searchSkills(query);
    }

    /**
     * Apply sorting to applicant list.
     * Currently only 'newest' is supported since JA doesn't have salary.
     */
    private List<ApplicantResponse> applySorting(List<ApplicantResponse> applicants, String sortBy) {
        if (applicants == null || applicants.isEmpty()) {
            return applicants;
        }
        
        if (sortBy == null || sortBy.isEmpty() || "newest".equals(sortBy)) {
            // JA returns in order already, but we can re-sort if needed
            return applicants.stream()
                    .sorted(Comparator.comparing(
                            ApplicantResponse::getCreatedAt,
                            Comparator.nullsLast(Comparator.reverseOrder())
                    ))
                    .collect(Collectors.toList());
        }

        // TODO: Salary sorting - uncomment when JA adds salary fields
        // case "salaryAsc":
        //     return applicants.stream()
        //             .sorted(Comparator.comparing(ApplicantResponse::getDesiredSalary,
        //                     Comparator.nullsLast(Comparator.naturalOrder())))
        //             .collect(Collectors.toList());
        // case "salaryDesc":
        //     return applicants.stream()
        //             .sorted(Comparator.comparing(ApplicantResponse::getDesiredSalary,
        //                     Comparator.nullsLast(Comparator.reverseOrder())))
        //             .collect(Collectors.toList());

        return applicants;
    }
}
