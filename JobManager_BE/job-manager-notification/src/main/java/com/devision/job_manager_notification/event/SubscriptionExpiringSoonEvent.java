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
public class SubscriptionExpiringSoonEvent {


    private UUID subscriptionId;

    private UUID companyId;


    private String planType;

    private LocalDateTime expiresAt;

  
    private Integer daysRemaining;

  
    private String urgencyLevel;

   
    private Boolean hasAutoRenewal;

   
    private Double renewalPrice;

   
    private String currency;

   
    private String specialOffer;

   
    private Double discountPercentage;

    
    private String renewalUrl;

   
    private LocalDateTime eventTimestamp;

    
    private String eventSource;

    
    private Integer reminderCount;

    
    private Boolean isFinalReminder;

    
    public static SubscriptionExpiringSoonEvent create(
            UUID subscriptionId,
            UUID companyId,
            String planType,
            LocalDateTime expiresAt,
            Integer daysRemaining,
            Boolean hasAutoRenewal,
            Double renewalPrice,
            String currency,
            Integer reminderCount
    ) {
        String urgencyLevel = determineUrgencyLevel(daysRemaining);
        Boolean isFinalReminder = daysRemaining != null && daysRemaining <= 1;

        return SubscriptionExpiringSoonEvent.builder()
                .subscriptionId(subscriptionId)
                .companyId(companyId)
                .planType(planType)
                .expiresAt(expiresAt)
                .daysRemaining(daysRemaining)
                .urgencyLevel(urgencyLevel)
                .hasAutoRenewal(hasAutoRenewal)
                .renewalPrice(renewalPrice)
                .currency(currency)
                .reminderCount(reminderCount)
                .isFinalReminder(isFinalReminder)
                .eventTimestamp(LocalDateTime.now())
                .eventSource("subscription-service")
                .build();
    }

    
    private static String determineUrgencyLevel(Integer daysRemaining) {
        if (daysRemaining == null) {
            return "MEDIUM";
        }
        if (daysRemaining == 0) {
            return "CRITICAL";
        } else if (daysRemaining <= 2) {
            return "URGENT";
        } else if (daysRemaining <= 6) {
            return "HIGH";
        } else if (daysRemaining <= 14) {
            return "MEDIUM";
        } else {
            return "LOW";
        }
    }

    public String getUrgencyMessage() {
        if (daysRemaining == null) {
            return "Your subscription is expiring soon.";
        }

        if (daysRemaining == 0) {
            return "⚠️ URGENT: Your subscription expires TODAY! Renew now to avoid service interruption.";
        } else if (daysRemaining == 1) {
            return "⚠️ URGENT: Your subscription expires TOMORROW! Renew now to maintain premium access.";
        } else if (daysRemaining <= 3) {
            return String.format("⚠️ Your subscription expires in %d days. Renew now to ensure uninterrupted service.", daysRemaining);
        } else if (daysRemaining <= 7) {
            return String.format("Your subscription expires in %d days. Consider renewing soon.", daysRemaining);
        } else if (daysRemaining <= 14) {
            return String.format("Reminder: Your subscription expires in %d days.", daysRemaining);
        } else {
            return String.format("Your subscription will expire in %d days. Plan ahead for renewal.", daysRemaining);
        }
    }

 
    public String getRenewalCallToAction() {
        if (Boolean.FALSE.equals(hasAutoRenewal)) {
            return "Click here to renew your subscription and continue enjoying premium features without interruption.";
        } else {
            return "Your subscription will automatically renew. Ensure your payment method is up to date.";
        }
    }


    public boolean hasSpecialOffer() {
        return specialOffer != null && !specialOffer.trim().isEmpty();
    }


    public String getSpecialOfferMessage() {
        if (!hasSpecialOffer()) {
            return null;
        }

        if (discountPercentage != null && discountPercentage > 0) {
            return String.format("🎉 Special Offer: %s - Save %.0f%% when you renew now!", specialOffer, discountPercentage);
        }

        return String.format("🎉 Special Offer: %s", specialOffer);
    }
}
