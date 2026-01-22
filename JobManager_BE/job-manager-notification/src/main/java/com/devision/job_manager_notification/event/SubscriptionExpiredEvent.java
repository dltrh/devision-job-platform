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
public class SubscriptionExpiredEvent {

 
    private UUID subscriptionId;


    private UUID companyId;

    private String planType;

   
    private LocalDateTime subscriptionStartAt;

   
    private LocalDateTime expiredAt;

    
    private LocalDateTime eventTimestamp;

    
    private String eventSource;

    
    private Long subscriptionDurationDays;

   
    private Boolean hadAutoRenewal;

    
    private String expirationReason;

    
    private String additionalMessage;

    
    public static SubscriptionExpiredEvent create(
            UUID subscriptionId,
            UUID companyId,
            String planType,
            LocalDateTime subscriptionStartAt,
            LocalDateTime expiredAt,
            Boolean hadAutoRenewal,
            String expirationReason
    ) {
        Long durationDays = null;
        if (subscriptionStartAt != null && expiredAt != null) {
            durationDays = java.time.temporal.ChronoUnit.DAYS.between(subscriptionStartAt, expiredAt);
        }

        return SubscriptionExpiredEvent.builder()
                .subscriptionId(subscriptionId)
                .companyId(companyId)
                .planType(planType)
                .subscriptionStartAt(subscriptionStartAt)
                .expiredAt(expiredAt)
                .hadAutoRenewal(hadAutoRenewal)
                .expirationReason(expirationReason)
                .subscriptionDurationDays(durationDays)
                .eventTimestamp(LocalDateTime.now())
                .eventSource("subscription-service")
                .build();
    }

    
    public boolean isPaymentFailure() {
        return "PAYMENT_FAILED".equalsIgnoreCase(expirationReason);
    }

    
    public boolean isNaturalExpiry() {
        return "NATURAL_EXPIRY".equalsIgnoreCase(expirationReason);
    }

    
    public boolean wasCancelled() {
        return "CANCELLED".equalsIgnoreCase(expirationReason);
    }

    
    public String getExpirationReasonDescription() {
        if (isPaymentFailure()) {
            return "Your subscription expired due to a payment failure. Please update your payment information to renew.";
        } else if (wasCancelled()) {
            return "Your subscription was cancelled and has now expired.";
        } else {
            return "Your subscription period has ended. Renew now to continue enjoying premium features.";
        }
    }
}
