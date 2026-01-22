package com.devision.job_manager_subscription.dto.internal.request;

import com.devision.job_manager_subscription.model.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateSubscriptionRequest {

    private SubscriptionStatus status;

    private LocalDateTime startAt;

    private LocalDateTime endAt;
}
