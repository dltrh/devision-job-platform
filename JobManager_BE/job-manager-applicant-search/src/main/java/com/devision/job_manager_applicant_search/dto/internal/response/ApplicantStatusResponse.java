package com.devision.job_manager_applicant_search.dto.internal.response;

import com.devision.job_manager_applicant_search.model.ApplicantStatusType;
import com.devision.job_manager_applicant_search.model.CompanyApplicantStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for applicant status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicantStatusResponse {

    private UUID id;
    private UUID companyId;
    private UUID applicantId;
    private ApplicantStatusType status;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ApplicantStatusResponse fromEntity(CompanyApplicantStatus entity) {
        if (entity == null) {
            return null;
        }
        return ApplicantStatusResponse.builder()
                .id(entity.getId())
                .companyId(entity.getCompanyId())
                .applicantId(entity.getApplicantId())
                .status(entity.getStatus())
                .note(entity.getNote())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
