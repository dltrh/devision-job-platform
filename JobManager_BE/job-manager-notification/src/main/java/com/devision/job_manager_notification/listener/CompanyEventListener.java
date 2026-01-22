package com.devision.job_manager_notification.listener;

import com.devision.job_manager_notification.dto.internal.InternalCreateNotificationRequest;
import com.devision.job_manager_notification.enums.NotificationType;
import com.devision.job_manager_notification.event.CompanyAccountLockedEvent;
import com.devision.job_manager_notification.event.CompanyActivatedEvent;
import com.devision.job_manager_notification.event.CompanyRegisteredEvent;
import com.devision.job_manager_notification.service.InternalNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Kafka listener for company-related events.
 * Uses InternalNotificationService for creating notifications from event data.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CompanyEventListener {

    private final InternalNotificationService internalNotificationService;

    @KafkaListener(
            topics = "company.registered",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleCompanyRegistered(CompanyRegisteredEvent event) {
        try {
            log.info("Received CompanyRegisteredEvent for company: {}", event.getCompanyId());

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(event.getCompanyId())
                    .type(NotificationType.ACCOUNT)
                    .title("Welcome to Job Manager!")
                    .message("Your account has been created successfully. Please check your email to activate your account.")
                    .referenceId(event.getCompanyId().toString())
                    .referenceType("COMPANY_REGISTRATION")
                    .build();

            internalNotificationService.createNotification(notification);
            log.info("Notification created for company registration: {}", event.getCompanyId());
        } catch (Exception e) {
            log.error("Error processing CompanyRegisteredEvent for company: {}", event.getCompanyId(), e);
        }
    }

    @KafkaListener(
            topics = "company.activated",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleCompanyActivated(CompanyActivatedEvent event) {
        try {
            log.info("Received CompanyActivatedEvent for company: {}", event.getCompanyId());

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(event.getCompanyId())
                    .type(NotificationType.ACCOUNT)
                    .title("Account Activated Successfully")
                    .message("Your account has been activated! You can now start using all features of Job Manager.")
                    .referenceId(event.getCompanyId().toString())
                    .referenceType("COMPANY_ACTIVATION")
                    .build();

            internalNotificationService.createNotification(notification);
            log.info("Notification created for company activation: {}", event.getCompanyId());
        } catch (Exception e) {
            log.error("Error processing CompanyActivatedEvent for company: {}", event.getCompanyId(), e);
        }
    }

    @KafkaListener(
            topics = "company.account.locked",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleCompanyAccountLocked(CompanyAccountLockedEvent event) {
        try {
            log.info("Received CompanyAccountLockedEvent for company: {}", event.getCompanyId());

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(event.getCompanyId())
                    .type(NotificationType.ALERT)
                    .title("Account Locked")
                    .message("Your account has been locked due to: " + event.getReason() + ". Please contact support for assistance.")
                    .referenceId(event.getCompanyId().toString())
                    .referenceType("COMPANY_ACCOUNT_LOCKED")
                    .build();

            internalNotificationService.createNotification(notification);
            log.info("Notification created for company account locked: {}", event.getCompanyId());
        } catch (Exception e) {
            log.error("Error processing CompanyAccountLockedEvent for company: {}", event.getCompanyId(), e);
        }
    }

    @KafkaListener(
            topics = "company.country.changed",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleCompanyCountryChanged(java.util.Map<String, Object> payload) {
        try {
            java.util.UUID companyId = parseUUID(payload.get("companyId"));
            String previousCountryCode = (String) payload.get("previousCountryCode");
            String newCountryCode = (String) payload.get("newCountryCode");

            log.info("Received company.country.changed event for company: {}, from: {} to: {}",
                    companyId, previousCountryCode, newCountryCode);

            if (companyId == null) {
                log.error("Company country changed event has null companyId, skipping");
                return;
            }

            String message = String.format("Your company location has been updated from %s to %s. " +
                    "This may affect your job postings and applicant matching.",
                    previousCountryCode != null ? previousCountryCode : "Unknown",
                    newCountryCode != null ? newCountryCode : "Unknown");

            String metadata = String.format("{\"companyId\":\"%s\",\"previousCountryCode\":\"%s\",\"newCountryCode\":\"%s\",\"timestamp\":\"%s\"}",
                    companyId,
                    previousCountryCode != null ? previousCountryCode : "",
                    newCountryCode != null ? newCountryCode : "",
                    java.time.LocalDateTime.now());

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(companyId)
                    .type(NotificationType.SYSTEM)
                    .title("🌍 Company Location Updated")
                    .message(message)
                    .referenceId(companyId.toString())
                    .referenceType("COMPANY_COUNTRY_CHANGED")
                    .metadata(metadata)
                    .build();

            internalNotificationService.createNotification(notification);
            log.info("Notification created for company country change: {}", companyId);
        } catch (Exception e) {
            log.error("Error processing company.country.changed event: {}", e.getMessage(), e);
        }
    }

    private java.util.UUID parseUUID(Object value) {
        if (value == null) return null;
        if (value instanceof java.util.UUID) return (java.util.UUID) value;
        if (value instanceof String) {
            try {
                return java.util.UUID.fromString((String) value);
            } catch (IllegalArgumentException e) {
                log.warn("Failed to parse UUID from string: {}", value);
                return null;
            }
        }
        return null;
    }
}
