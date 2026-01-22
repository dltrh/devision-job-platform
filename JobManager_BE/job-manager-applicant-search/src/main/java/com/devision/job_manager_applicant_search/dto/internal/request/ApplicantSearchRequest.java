package com.devision.job_manager_applicant_search.dto.internal.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for applicant search filters.
 * Maps frontend filter state to backend search parameters.
 * 
 * Aligned with JA service's /api/v1/users/search endpoint parameters:
 * - skills: CSV skill names
 * - country: country code
 * - city: city name
 * - education: education level (enum)
 * - workExperience: CSV keywords
 * - employmentTypes: CSV employment types
 * - username: name search
 * 
 * TODO: Salary Filtering
 * JA service currently does not have salary fields in UserResponse.
 * When JA adds salary support, uncomment minSalary and maxSalary fields.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicantSearchRequest {

    /**
     * Username/name search (firstName, lastName).
     * Maps to JA's 'username' parameter.
     */
    private String username;

    /**
     * Full-Text Search query for searching across Work Experience, 
     * Objective Summary, and Technical Skills fields.
     * Case-insensitive search.
     */
    private String ftsQuery;

    /**
     * Country code filter (e.g., "US", "VN").
     * Maps to JA's 'country' parameter.
     */
    private String countryCode;

    /**
     * City filter.
     * Maps to JA's 'city' parameter.
     */
    private String city;

    /**
     * Skill names to filter by (OR semantics).
     * Maps to JA's 'skills' parameter (comma-separated).
     */
    private List<String> skills;

    /**
     * Employment types to filter by.
     * Maps to JA's 'employmentTypes' parameter (comma-separated).
     * Values: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FRESHER
     */
    private List<String> employmentTypes;

    /**
     * Highest education degree filter.
     * Maps to JA's 'education' parameter.
     * Values: HIGH_SCHOOL, ASSOCIATE, BACHELOR, MASTER, DOCTORATE
     */
    private String education;

    /**
     * Work experience keywords filter.
     * Maps to JA's 'workExperience' parameter (comma-separated keywords).
     */
    private String workExperience;

    /**
     * Sort option (e.g., "newest", "salaryAsc", "salaryDesc").
     * Note: Sorting is done locally as JA does not support sorting.
     */
    private String sortBy;

    /**
     * Page number (0-indexed).
     */
    private Integer page;

    /**
     * Page size.
     */
    private Integer pageSize;

    // TODO: Salary filtering - uncomment when JA adds salary support
    // private BigDecimal minSalary;
    // private BigDecimal maxSalary;
}
