package com.devision.job_manager_jobpost.dto.external;

import com.devision.job_manager_jobpost.model.EmploymentType;
import com.devision.job_manager_jobpost.model.SalaryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSearchResultDto {
    private UUID id;
    private UUID companyId;
    private String title;
    private String description;
    private String locationCity;
    private String countryCode;
    private SalaryType salaryType;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String salaryNote;
    private List<EmploymentType> employmentTypes;
    private boolean isFresher;
    private List<UUID> skillIds;
    private LocalDateTime postedAt;
    private LocalDateTime expiryAt;
    private boolean isActive;
    // the published field will always be true since we only let JA get the published job posts
}
