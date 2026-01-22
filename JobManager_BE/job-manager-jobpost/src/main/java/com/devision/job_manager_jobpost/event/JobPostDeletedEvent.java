package com.devision.job_manager_jobpost.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostDeletedEvent {
    private UUID jobPostId;
    private UUID companyId;
    private LocalDateTime deletedAt;
}
