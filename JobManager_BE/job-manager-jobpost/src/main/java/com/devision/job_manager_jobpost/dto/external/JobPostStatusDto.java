package com.devision.job_manager_jobpost.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostStatusDto {
    private UUID id;
    private UUID companyId;
    private boolean isPublished;
    private boolean isExpired;
    private boolean isActive;
}