package com.devision.job_manager_subscription.dto.internal.request;

import com.devision.job_manager_subscription.model.SubscriptionStatus;
import jakarta.validation.constraints.NotNull;
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
public class CreateSubscriptionRequest {

    @NotNull(message = "Company ID is required")
    private UUID companyId;

    private SubscriptionStatus status;

    private LocalDateTime startAt;

    private LocalDateTime endAt;
}
