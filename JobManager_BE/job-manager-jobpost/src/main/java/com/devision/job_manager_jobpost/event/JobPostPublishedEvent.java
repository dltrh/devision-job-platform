package com.devision.job_manager_jobpost.event;

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
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostPublishedEvent {
    private UUID jobPostId;
    private UUID companyId;
    private String title;
    private String description;
    private String locationCity;
    private String countryCode;
    private SalaryType salaryType;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private List<EmploymentType> employmentTypes;
    private boolean fresher;
    private List<UUID> skillIds;
    private LocalDateTime publishedAt;
    private LocalDateTime expiryAt;
}
