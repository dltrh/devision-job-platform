package com.devision.job_manager_jobpost.dto;

import com.devision.job_manager_jobpost.model.EmploymentType;
import com.devision.job_manager_jobpost.model.SalaryType;
import com.fasterxml.jackson.annotation.JsonProperty;
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
public class JobPostDto {
    private UUID id;
    private UUID companyId;
    private String title;
    private String description;
    
    @JsonProperty("isFresher")
    private boolean fresher;
    
    private SalaryType salaryType;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String salaryNote;
    private String locationCity;
    private String countryCode;
    
    @JsonProperty("isPublished")
    private boolean published;
    
    @JsonProperty("isPrivate")
    private boolean aPrivate;
    
    private LocalDateTime postedAt;
    private LocalDateTime expiryAt;

    private List<UUID> skillIds;
    
    // Employment types - return single value for frontend compatibility
    private EmploymentType employmentType;
}


