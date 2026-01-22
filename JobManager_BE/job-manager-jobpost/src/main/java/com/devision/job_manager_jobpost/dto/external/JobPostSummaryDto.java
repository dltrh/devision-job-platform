package com.devision.job_manager_jobpost.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * External DTO for job post summary (lightweight)
 * Used for listings in other services
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostSummaryDto {
    private UUID id;
    private UUID companyId;
    private String title;
    private String locationCity;
    // private UUID countryId;
    private SalaryInfoDto salary;
    private boolean isFresher;
    private LocalDateTime postedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalaryInfoDto {
        private String type;
        private BigDecimal min;
        private BigDecimal max;
        private String note;
    }
}