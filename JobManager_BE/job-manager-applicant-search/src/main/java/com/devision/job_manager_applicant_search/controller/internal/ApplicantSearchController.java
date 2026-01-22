package com.devision.job_manager_applicant_search.controller.internal;

import com.devision.job_manager_applicant_search.dto.ApiResponse;
import com.devision.job_manager_applicant_search.dto.internal.request.ApplicantSearchRequest;
import com.devision.job_manager_applicant_search.dto.internal.response.ApplicantResponse;
import com.devision.job_manager_applicant_search.model.ApplicantStatusType;
import com.devision.job_manager_applicant_search.model.CompanyApplicantStatus;
import com.devision.job_manager_applicant_search.repository.CompanyApplicantStatusRepository;
import com.devision.job_manager_applicant_search.service.ApplicantSearchService;
import com.devision.job_manager_applicant_search.service.ApplicantSearchService.ApplicantSearchResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * REST controller for applicant search operations.
 * 
 * Aligned with JA's /api/v1/users/search endpoint as of 2026-01-04.
 */
@RestController
@RequestMapping("/api/internal/applicants")
@RequiredArgsConstructor
public class ApplicantSearchController {

    private final ApplicantSearchService applicantSearchService;
    private final CompanyApplicantStatusRepository statusRepository;

    /**
     * Search for applicants using filter criteria.
     * 
     * Supported filters (aligned with JA service):
     * - username: Name search (firstName, lastName)
     * - ftsQuery: Full-Text Search across Work Experience, Objective Summary, and Technical Skills
     * - countryCode: Two-letter country code
     * - city: City name filter
     * - education: Education level (HIGH_SCHOOL, ASSOCIATE, BACHELOR, MASTER, DOCTORATE)
     * - workExperience: Work experience keywords
     * - employmentTypes: Employment types (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FRESHER)
     * - skills: Skill names
     * - page, size: Pagination
     * - statusFilter: Filter by company-specific status (FAVORITE, WARNING, MARKED)
     * 
     * Results are enriched with company-specific Warning/Favorite status if X-Company-Id header is provided.
     * 
     * TODO: Salary filtering - will be added when JA supports it
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<ApplicantSearchResult>> searchApplicants(
            @RequestHeader(value = "X-Company-Id", required = false) UUID companyId,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String ftsQuery,
            @RequestParam(required = false) String countryCode,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String education,
            @RequestParam(required = false) String workExperience,
            @RequestParam(required = false) List<String> employmentTypes,
            @RequestParam(required = false) List<String> skills,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size,
            @RequestParam(required = false) String statusFilter
            // TODO: Salary filtering - uncomment when JA supports it
            // @RequestParam(required = false) BigDecimal minSalary,
            // @RequestParam(required = false) BigDecimal maxSalary
    ) {
        ApplicantSearchRequest request = ApplicantSearchRequest.builder()
                .username(username)
                .ftsQuery(ftsQuery)
                .countryCode(countryCode)
                .city(city)
                .education(education)
                .workExperience(workExperience)
                .employmentTypes(employmentTypes)
                .skills(skills)
                .sortBy(sortBy)
                .page(page)
                .pageSize(size)
                // .minSalary(minSalary)
                // .maxSalary(maxSalary)
                .build();

        ApplicantSearchResult result = applicantSearchService.searchApplicants(request);

        // Enrich with company-specific status if company ID is provided
        if (companyId != null && !result.content().isEmpty()) {
            enrichWithStatus(result.content(), companyId);

            // Apply status filter if provided
            if (statusFilter != null && !statusFilter.isEmpty() && !"ALL".equalsIgnoreCase(statusFilter)) {
                List<ApplicantResponse> filtered = filterByStatus(result.content(), statusFilter);
                result = new ApplicantSearchResult(
                        filtered,
                        result.page(),
                        result.size(),
                        filtered.size(),
                        1,
                        true,
                        true
                );
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Applicants retrieved", result));
    }

    /**
     * Filter applicants by company status.
     */
    private List<ApplicantResponse> filterByStatus(List<ApplicantResponse> applicants, String statusFilter) {
        return applicants.stream()
                .filter(a -> {
                    String status = a.getCompanyStatus();
                    if ("MARKED".equalsIgnoreCase(statusFilter)) {
                        return "FAVORITE".equals(status) || "WARNING".equals(status);
                    }
                    return statusFilter.equalsIgnoreCase(status);
                })
                .collect(Collectors.toList());
    }

    /**
     * Enrich applicant list with company-specific Warning/Favorite status.
     */
    private void enrichWithStatus(List<ApplicantResponse> applicants, UUID companyId) {
        // Extract applicant IDs
        List<UUID> applicantIds = applicants.stream()
                .map(a -> a.getId())
                .collect(Collectors.toList());

        // Bulk fetch statuses
        List<CompanyApplicantStatus> statuses = statusRepository.findByCompanyIdAndApplicantIdIn(companyId, applicantIds);

        // Build lookup map
        Map<UUID, CompanyApplicantStatus> statusMap = statuses.stream()
                .collect(Collectors.toMap(CompanyApplicantStatus::getApplicantId, s -> s));

        // Enrich each applicant
        for (ApplicantResponse applicant : applicants) {
            CompanyApplicantStatus status = statusMap.get(applicant.getId());
            if (status != null) {
                applicant.setCompanyStatus(status.getStatus().name());
                applicant.setCompanyStatusNote(status.getNote());
            } else {
                applicant.setCompanyStatus(ApplicantStatusType.NONE.name());
                applicant.setCompanyStatusNote(null);
            }
        }
    }

    /**
     * Get all available skills for filter dropdown.
     */
    @GetMapping("/skills")
    public ResponseEntity<ApiResponse<List<ApplicantResponse.SkillDto>>> getSkills() {
        List<ApplicantResponse.SkillDto> skills = applicantSearchService.getSkills();
        return ResponseEntity.ok(ApiResponse.success("Skills retrieved", skills));
    }

    /**
     * Search skills by name for autocomplete.
     * 
     * @param q Search query
     */
    @GetMapping("/skills/search")
    public ResponseEntity<ApiResponse<List<ApplicantResponse.SkillDto>>> searchSkills(
            @RequestParam(required = false) String q) {
        List<ApplicantResponse.SkillDto> skills = applicantSearchService.searchSkills(q);
        return ResponseEntity.ok(ApiResponse.success("Skills retrieved", skills));
    }
}
