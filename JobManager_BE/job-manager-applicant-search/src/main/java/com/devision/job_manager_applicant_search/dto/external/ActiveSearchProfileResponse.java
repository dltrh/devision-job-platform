package com.devision.job_manager_applicant_search.dto.external;

import com.devision.job_manager_applicant_search.model.ApplicantSearchProfile;
import com.devision.job_manager_applicant_search.model.EducationDegree;
import com.devision.job_manager_applicant_search.model.EmploymentType;
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
public class ActiveSearchProfileResponse {

    private UUID id;
    private UUID companyId;
    private String profileName;
    private String countryCode;
    private String city;
    private String workExperience;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private EducationDegree education;
    private Set<EmploymentType> employmentTypes;
    private Set<UUID> skillIds;

    /**
     * TODO: Salary Filtering
     * JA service currently does not have salary fields in UserResponse.
     * When JA adds salary support, uncomment minSalary and maxSalary fields.
     */
    public static ActiveSearchProfileResponse fromEntity(ApplicantSearchProfile profile) {
        return ActiveSearchProfileResponse.builder()
                .id(profile.getId())
                .companyId(profile.getCompanyId())
                .profileName(profile.getProfileName())
                .countryCode(profile.getCountryCode())
                .city(profile.getCity())
                .workExperience(profile.getWorkExperience())
                // .minSalary(profile.getMinSalary())
                // .maxSalary(profile.getMaxSalary())
                .education(profile.getEducation())
                .employmentTypes(profile.getEmploymentTypeValues())
                .skillIds(profile.getSkillIds())
                .build();
    }
}
