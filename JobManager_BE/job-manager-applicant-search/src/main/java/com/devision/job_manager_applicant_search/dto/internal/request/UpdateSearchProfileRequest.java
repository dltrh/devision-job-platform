package com.devision.job_manager_applicant_search.dto.internal.request;

import com.devision.job_manager_applicant_search.model.EducationDegree;
import com.devision.job_manager_applicant_search.model.EmploymentType;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateSearchProfileRequest {

    @Size(max = 255, message = "Profile name must be less than 255 characters")
    private String profileName;

    @Size(min = 2, max = 2, message = "Country code must be 2 characters (ISO 3166-1 alpha-2)")
    private String countryCode;

    /**
     * City filter for the search profile.
     */
    @Size(max = 100, message = "City must be less than 100 characters")
    private String city;

    /**
     * Work experience keywords filter.
     */
    @Size(max = 500, message = "Work experience must be less than 500 characters")
    private String workExperience;

    /**
     * Salary range for profile matching (used in Kafka notification matching).
     * TODO: Salary for Search - Not used in search API filtering until JA adds salary to UserResponse.
     */
    private BigDecimal minSalary;
    private BigDecimal maxSalary;

    /**
     * Education level filter.
     */
    private EducationDegree education;

    private Set<EmploymentType> employmentTypes;
    private Set<UUID> skillIds;
    private Boolean isActive;
}
