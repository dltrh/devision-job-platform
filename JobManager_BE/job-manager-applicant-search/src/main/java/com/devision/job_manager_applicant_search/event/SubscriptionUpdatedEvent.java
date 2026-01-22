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
public class SubscriptionUpdatedEvent {

    private UUID companyId;
    
    private String status;
    
    private LocalDateTime endAt;
    
    private boolean isPremium;
    
    private LocalDateTime timestamp;
}
