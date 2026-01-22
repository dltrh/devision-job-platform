package com.devision.job_manager_notification.event;

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
public class SubscriptionRenewedEvent {

  
    private UUID subscriptionId;


    private UUID companyId;

    
    private String planType;

    
    private LocalDateTime previousEndAt;

    
    private LocalDateTime newEndAt;

   
    private String paymentReferenceId;

   
    private Double renewalAmount;

    private String currency;

    private LocalDateTime renewalTimestamp;

 
    private LocalDateTime eventTimestamp;

 
    private String eventSource;

    private Boolean isAutoRenewal;

   
    public static SubscriptionRenewedEvent create(
            UUID subscriptionId,
            UUID companyId,
            String planType,
            LocalDateTime previousEndAt,
            LocalDateTime newEndAt,
            String paymentReferenceId,
            Double renewalAmount,
            String currency,
            Boolean isAutoRenewal
    ) {
        return SubscriptionRenewedEvent.builder()
                .subscriptionId(subscriptionId)
                .companyId(companyId)
                .planType(planType)
                .previousEndAt(previousEndAt)
                .newEndAt(newEndAt)
                .paymentReferenceId(paymentReferenceId)
                .renewalAmount(renewalAmount)
                .currency(currency)
                .isAutoRenewal(isAutoRenewal)
                .renewalTimestamp(LocalDateTime.now())
                .eventTimestamp(LocalDateTime.now())
                .eventSource("subscription-service")
                .build();
    }


    public long getExtendedDurationInDays() {
        if (previousEndAt == null || newEndAt == null) {
            return 0;
        }
        return java.time.temporal.ChronoUnit.DAYS.between(previousEndAt, newEndAt);
    }

    /**
     * Gets a formatted string describing the renewal type.
     *
     * @return "Automatic Renewal" or "Manual Renewal"
     */
    public String getRenewalTypeDescription() {
        return Boolean.TRUE.equals(isAutoRenewal) ? "Automatic Renewal" : "Manual Renewal";
    }
}
