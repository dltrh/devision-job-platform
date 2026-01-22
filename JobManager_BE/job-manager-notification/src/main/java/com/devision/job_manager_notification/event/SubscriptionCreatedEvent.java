package com.devision.job_manager_notification.event;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
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
public class SubscriptionCreatedEvent {

    private UUID subscriptionId;

    private UUID companyId;

    private String planType;

    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startAt;

    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime endAt;

    private String paymentReferenceId;

    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime eventTimestamp;

    private String eventSource;

    
    public static SubscriptionCreatedEvent create(
            UUID subscriptionId,
            UUID companyId,
            String planType,
            LocalDateTime startAt,
            LocalDateTime endAt,
            String paymentReferenceId
    ) {
        return SubscriptionCreatedEvent.builder()
                .subscriptionId(subscriptionId)
                .companyId(companyId)
                .planType(planType)
                .startAt(startAt)
                .endAt(endAt)
                .paymentReferenceId(paymentReferenceId)
                .eventTimestamp(LocalDateTime.now())
                .eventSource("subscription-service")
                .build();
    }

    
    public boolean isIndefiniteSubscription() {
        return endAt == null;
    }

    public long getSubscriptionDurationInDays() {
        if (endAt == null || startAt == null) {
            return -1;
        }
        return java.time.temporal.ChronoUnit.DAYS.between(startAt, endAt);
    }
}
