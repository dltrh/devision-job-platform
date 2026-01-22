package com.devision.job_manager_jobpost.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostBasicInfoDto {
    private UUID id;
    private UUID companyId;
    private String title;
    private String description;
    private boolean isPublished;
    private boolean isFresher;
    private String locationCity;
    // private UUID countryId;
    private LocalDateTime postedAt;
    private LocalDateTime expiryAt;
}