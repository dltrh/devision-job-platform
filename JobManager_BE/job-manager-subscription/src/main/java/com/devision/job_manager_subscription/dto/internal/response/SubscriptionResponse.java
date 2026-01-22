package com.devision.job_manager_subscription.dto.internal.response;

import com.devision.job_manager_subscription.model.CompanySubscription;
import com.devision.job_manager_subscription.model.SubscriptionStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
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
public class SubscriptionResponse {

    private UUID id;
    private UUID companyId;
    private SubscriptionStatus status;
    private LocalDateTime startAt;
    private LocalDateTime endAt;

    @JsonProperty("isPremium")
    private boolean isPremium;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SubscriptionResponse fromEntity(CompanySubscription subscription) {
        return SubscriptionResponse.builder()
                .id(subscription.getId())
                .companyId(subscription.getCompanyId())
                .status(subscription.getStatus())
                .startAt(subscription.getStartAt())
                .endAt(subscription.getEndAt())
                .isPremium(subscription.isPremium())
                .createdAt(subscription.getCreatedAt())
                .updatedAt(subscription.getUpdatedAt())
                .build();
    }
}
