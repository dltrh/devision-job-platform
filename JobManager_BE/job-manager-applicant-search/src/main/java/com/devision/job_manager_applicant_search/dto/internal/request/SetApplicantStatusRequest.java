package com.devision.job_manager_applicant_search.dto.internal.request;

import com.devision.job_manager_applicant_search.model.ApplicantStatusType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for setting applicant status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SetApplicantStatusRequest {

    @NotNull(message = "Status is required")
    private ApplicantStatusType status;

    @Size(max = 500, message = "Note must be less than 500 characters")
    private String note;
}
