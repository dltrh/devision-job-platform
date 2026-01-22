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
public class SubscriptionCancelledEvent {

    // Unique identifier of the cancelled subscription.
    
    private UUID subscriptionId;

    // Company ID that owns this subscription.
     
    private UUID companyId;

    // Subscription plan type that was cancelled.
    private String planType;

    //Date when the subscription was originally activated.
  
    private LocalDateTime subscriptionStartAt;

    //Date when the cancellation was requested.

    private LocalDateTime cancelledAt;

    private LocalDateTime accessEndsAt;

    // Reason for cancellation provided by the company.
     
    private String cancellationReason;

    // Optional detailed feedback from the company about why they're cancelling.

    private String customerFeedback;

    // Whether the cancellation is immediate or scheduled for end of period.

    private Boolean isImmediateCancellation;

    // Whether a refund will be processed for the cancellation.

    private Boolean willProcessRefund;

    // Amount to be refunded if applicable.

    private Double refundAmount;

    // Currency code for the refund amount.

    private String currency;

    // Timestamp when this event was created.

    private LocalDateTime eventTimestamp;

    // Source system that generated this event.

    private String eventSource;

    // User ID or admin ID who initiated the cancellation.

    private UUID initiatedBy;

    // Whether this was cancelled by the customer or by admin/system.

    private String cancelledByType;


    public static SubscriptionCancelledEvent create(
            UUID subscriptionId,
            UUID companyId,
            String planType,
            LocalDateTime subscriptionStartAt,
            LocalDateTime accessEndsAt,
            String cancellationReason,
            Boolean isImmediateCancellation,
            UUID initiatedBy,
            String cancelledByType
    ) {
        return SubscriptionCancelledEvent.builder()
                .subscriptionId(subscriptionId)
                .companyId(companyId)
                .planType(planType)
                .subscriptionStartAt(subscriptionStartAt)
                .cancelledAt(LocalDateTime.now())
                .accessEndsAt(accessEndsAt)
                .cancellationReason(cancellationReason)
                .isImmediateCancellation(isImmediateCancellation)
                .willProcessRefund(false)
                .initiatedBy(initiatedBy)
                .cancelledByType(cancelledByType)
                .eventTimestamp(LocalDateTime.now())
                .eventSource("subscription-service")
                .build();
    }


    public boolean hasRemainingAccess() {
        if (Boolean.TRUE.equals(isImmediateCancellation)) {
            return false;
        }
        return accessEndsAt != null && accessEndsAt.isAfter(LocalDateTime.now());
    }


    public long getRemainingAccessDays() {
        if (!hasRemainingAccess()) {
            return 0;
        }
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), accessEndsAt);
    }

    public String getCancellationMessage() {
        if (Boolean.TRUE.equals(isImmediateCancellation)) {
            return "Your subscription has been cancelled immediately. Premium features are no longer available.";
        } else if (hasRemainingAccess()) {
            return String.format(
                "Your subscription has been cancelled but you will retain premium access until %s (%d days remaining).",
                accessEndsAt.toLocalDate(),
                getRemainingAccessDays()
            );
        } else {
            return "Your subscription has been cancelled and premium access has ended.";
        }
    }


    public boolean wasCancelledByCustomer() {
        return "CUSTOMER".equalsIgnoreCase(cancelledByType);
    }


    public boolean wasCancelledByAdmin() {
        return "ADMIN".equalsIgnoreCase(cancelledByType);
    }

    public boolean wasCancelledBySystem() {
        return "SYSTEM".equalsIgnoreCase(cancelledByType);
    }
}
