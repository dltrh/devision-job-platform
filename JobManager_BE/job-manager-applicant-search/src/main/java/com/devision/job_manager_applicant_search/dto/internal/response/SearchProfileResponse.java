package com.devision.job_manager_applicant_search.dto.internal.response;

import com.devision.job_manager_applicant_search.model.ApplicantSearchProfile;
import com.devision.job_manager_applicant_search.model.EducationDegree;
import com.devision.job_manager_applicant_search.model.EmploymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchProfileResponse {

    private UUID id;
    private UUID companyId;
    private String profileName;
    private String countryCode;
    private String city;
    private String workExperience;
    /**
     * Salary range for profile matching (used in Kafka notification matching).
     * TODO: Salary for Search - Not used in search API filtering until JA adds salary to UserResponse.
     */
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private EducationDegree education;
    private Set<EmploymentType> employmentTypes;
    private Set<UUID> skillIds;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SearchProfileResponse fromEntity(ApplicantSearchProfile profile) {
        return SearchProfileResponse.builder()
                .id(profile.getId())
                .companyId(profile.getCompanyId())
                .profileName(profile.getProfileName())
                .countryCode(profile.getCountryCode())
                .city(profile.getCity())
                .workExperience(profile.getWorkExperience())
                .minSalary(profile.getMinSalary())
                .maxSalary(profile.getMaxSalary())
                .education(profile.getEducation())
                .employmentTypes(profile.getEmploymentTypeValues())
                .skillIds(profile.getSkillIds())
                .isActive(profile.getIsActive())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
