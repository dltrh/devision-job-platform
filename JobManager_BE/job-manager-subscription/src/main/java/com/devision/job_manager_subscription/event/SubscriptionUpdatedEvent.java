package com.devision.job_manager_subscription.event;

import com.devision.job_manager_subscription.model.SubscriptionStatus;
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
    private SubscriptionStatus status;
    private LocalDateTime endAt;
    private boolean isPremium;
    private LocalDateTime timestamp;

    public static SubscriptionUpdatedEvent fromSubscription(
            UUID companyId, 
            SubscriptionStatus status, 
            LocalDateTime endAt, 
            boolean isPremium
    ) {
        return SubscriptionUpdatedEvent.builder()
                .companyId(companyId)
                .status(status)
                .endAt(endAt)
                .isPremium(isPremium)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
