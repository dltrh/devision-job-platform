package com.devision.job_manager_applicant_search.event;

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
public class CompanyNotificationEvent {

    private UUID companyId;
    
    private String type;
    
    private String message;
    
    private UUID applicantId;
    
    private UUID searchProfileId;
    
    private LocalDateTime timestamp;

    public static CompanyNotificationEvent applicantMatch(
            UUID companyId,
            UUID applicantId,
            UUID searchProfileId,
            String profileName
    ) {
        return CompanyNotificationEvent.builder()
                .companyId(companyId)
                .type("APPLICANT_MATCH")
                .message("A new applicant matches your saved search: " + profileName)
                .applicantId(applicantId)
                .searchProfileId(searchProfileId)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
