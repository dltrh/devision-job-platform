package com.devision.job_manager_jobpost.dto.external;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponseDto {

    private UUID id;
    private UUID userId;
    private UUID jobPostId;
    private String resumeUrl;
    private String coverLetterUrl;
    private String status;
    private String userNotes;
    private String adminNotes;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
