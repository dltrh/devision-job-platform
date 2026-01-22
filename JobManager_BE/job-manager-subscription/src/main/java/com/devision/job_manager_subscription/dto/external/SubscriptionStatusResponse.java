package com.devision.job_manager_subscription.dto.external;

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
public class SubscriptionStatusResponse {

    private UUID companyId;
    private SubscriptionStatus status;
    private LocalDateTime endAt;

    @JsonProperty("isPremium")
    private boolean isPremium;

    public static SubscriptionStatusResponse fromEntity(CompanySubscription subscription) {
        return SubscriptionStatusResponse.builder()
                .companyId(subscription.getCompanyId())
                .status(subscription.getStatus())
                .endAt(subscription.getEndAt())
                .isPremium(subscription.isPremium())
                .build();
    }

    // Creates a non-premium response for companies without subscriptions
    public static SubscriptionStatusResponse notPremium(UUID companyId) {
        return SubscriptionStatusResponse.builder()
                .companyId(companyId)
                .status(SubscriptionStatus.INACTIVE)
                .endAt(null)
                .isPremium(false)
                .build();
    }
}
