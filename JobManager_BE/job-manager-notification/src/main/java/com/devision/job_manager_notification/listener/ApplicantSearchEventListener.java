package com.devision.job_manager_notification.listener;

import com.devision.job_manager_notification.dto.internal.InternalCreateNotificationRequest;
import com.devision.job_manager_notification.enums.NotificationType;
import com.devision.job_manager_notification.event.CompanyNotificationEvent;
import com.devision.job_manager_notification.service.InternalNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Kafka listener for applicant search related events.
 * Listens to company.notification topic for applicant match notifications.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicantSearchEventListener {

    private final InternalNotificationService internalNotificationService;

    @KafkaListener(
            topics = "company.notification",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleCompanyNotification(
            @Payload java.util.Map<String, Object> payload,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        CompanyNotificationEvent event = null;
        LocalDateTime startTime = LocalDateTime.now();

        try {
            log.info("Received CompanyNotificationEvent from partition: {}, offset: {}", partition, offset);

            // Convert Map to CompanyNotificationEvent
            event = mapToCompanyNotificationEvent(payload);

            // Validate event
            if (event == null) {
                log.error("Failed to map payload to CompanyNotificationEvent. Payload: {}", payload);
                return;
            }

            if (event.getCompanyId() == null) {
                log.error("CompanyNotificationEvent has null companyId. Event: {}", event);
                return;
            }

            if (event.getType() == null || event.getType().trim().isEmpty()) {
                log.error("CompanyNotificationEvent has null or empty type. Event: {}", event);
                return;
            }

            if (event.getMessage() == null || event.getMessage().trim().isEmpty()) {
                log.error("CompanyNotificationEvent has null or empty message. Event: {}", event);
                return;
            }

            log.info("Processing CompanyNotificationEvent - Type: {}, Company: {}, Applicant: {}, SearchProfile: {}",
                    event.getType(), event.getCompanyId(), event.getApplicantId(), event.getSearchProfileId());

            // Handle different notification types
            if ("APPLICANT_MATCH".equals(event.getType())) {
                handleApplicantMatch(event);
            } else {
                log.warn("Unknown notification type: {}. Creating generic notification.", event.getType());
                handleGenericNotification(event);
            }

            log.info("Successfully processed CompanyNotificationEvent for company: {} in {}ms",
                    event.getCompanyId(),
                    java.time.Duration.between(startTime, LocalDateTime.now()).toMillis());

        } catch (IllegalArgumentException e) {
            log.error("Invalid data in CompanyNotificationEvent. Event: {}, Error: {}",
                    event != null ? event : payload, e.getMessage(), e);
        } catch (NullPointerException e) {
            log.error("Null pointer exception processing CompanyNotificationEvent. Event: {}",
                    event != null ? event : payload, e);
        } catch (Exception e) {
            log.error("Unexpected error processing CompanyNotificationEvent for company: {}. Event: {}",
                    event != null ? event.getCompanyId() : "UNKNOWN",
                    event != null ? event : payload, e);
        }
    }

    /**
     * Handles APPLICANT_MATCH notification type
     */
    private void handleApplicantMatch(CompanyNotificationEvent event) {
        try {
            log.info("Creating applicant match notification for company: {}, applicant: {}, searchProfile: {}",
                    event.getCompanyId(), event.getApplicantId(), event.getSearchProfileId());

            // Validate applicant-specific fields
            if (event.getApplicantId() == null) {
                log.error("APPLICANT_MATCH event missing applicantId. Event: {}", event);
                return;
            }

            if (event.getSearchProfileId() == null) {
                log.warn("APPLICANT_MATCH event missing searchProfileId. Event: {}", event);
            }

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(event.getCompanyId())
                    .type(NotificationType.SYSTEM)
                    .title("New Applicant Match")
                    .message(event.getMessage())
                    .referenceId(event.getApplicantId().toString())
                    .referenceType("APPLICANT_MATCH")
                    .build();

            internalNotificationService.createNotification(notification);

            log.info("Successfully created applicant match notification for company: {}, applicant: {}",
                    event.getCompanyId(), event.getApplicantId());

        } catch (Exception e) {
            log.error("Error creating applicant match notification for company: {}, applicant: {}",
                    event.getCompanyId(), event.getApplicantId(), e);
            throw e;
        }
    }

    /**
     * Handles generic notification types
     */
    private void handleGenericNotification(CompanyNotificationEvent event) {
        try {
            log.info("Creating generic notification for company: {}, type: {}",
                    event.getCompanyId(), event.getType());

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(event.getCompanyId())
                    .type(NotificationType.SYSTEM)
                    .title(event.getType())
                    .message(event.getMessage())
                    .referenceId(event.getCompanyId().toString())
                    .referenceType(event.getType())
                    .build();

            internalNotificationService.createNotification(notification);

            log.info("Successfully created generic notification for company: {}, type: {}",
                    event.getCompanyId(), event.getType());

        } catch (Exception e) {
            log.error("Error creating generic notification for company: {}, type: {}",
                    event.getCompanyId(), event.getType(), e);
            throw e;
        }
    }

    /**
     * Maps the Kafka payload Map to CompanyNotificationEvent
     */
    private CompanyNotificationEvent mapToCompanyNotificationEvent(java.util.Map<String, Object> payload) {
        try {
            if (payload == null || payload.isEmpty()) {
                log.error("Payload is null or empty");
                return null;
            }

            log.debug("Mapping payload to CompanyNotificationEvent. Payload keys: {}", payload.keySet());

            CompanyNotificationEvent event = CompanyNotificationEvent.builder()
                    .companyId(parseUUID(payload.get("companyId"), "companyId"))
                    .type((String) payload.get("type"))
                    .message((String) payload.get("message"))
                    .applicantId(parseUUID(payload.get("applicantId"), "applicantId"))
                    .searchProfileId(parseUUID(payload.get("searchProfileId"), "searchProfileId"))
                    .timestamp(parseLocalDateTime(payload.get("timestamp")))
                    .build();

            log.debug("Successfully mapped payload to CompanyNotificationEvent: {}", event);
            return event;

        } catch (Exception e) {
            log.error("Error mapping payload to CompanyNotificationEvent. Payload: {}", payload, e);
            return null;
        }
    }

    /**
     * Parses UUID from various formats
     */
    private java.util.UUID parseUUID(Object uuidObj, String fieldName) {
        if (uuidObj == null) {
            log.debug("Field '{}' is null", fieldName);
            return null;
        }

        try {
            if (uuidObj instanceof String) {
                return java.util.UUID.fromString((String) uuidObj);
            } else if (uuidObj instanceof java.util.UUID) {
                return (java.util.UUID) uuidObj;
            } else {
                log.warn("Field '{}' has unexpected type: {}. Value: {}",
                        fieldName, uuidObj.getClass().getName(), uuidObj);
                return java.util.UUID.fromString(uuidObj.toString());
            }
        } catch (IllegalArgumentException e) {
            log.error("Failed to parse UUID for field '{}'. Value: {}", fieldName, uuidObj, e);
            return null;
        }
    }

    /**
     * Parses LocalDateTime from various formats
     */
    private java.time.LocalDateTime parseLocalDateTime(Object dateTimeObj) {
        if (dateTimeObj == null) {
            log.debug("DateTime object is null, using current time");
            return LocalDateTime.now();
        }

        try {
            if (dateTimeObj instanceof java.util.List) {
                // Handle array format: [2026, 1, 10, 14, 13, 51, 660735000]
                java.util.List<Integer> dateTimeParts = (java.util.List<Integer>) dateTimeObj;

                if (dateTimeParts.size() < 6) {
                    log.error("DateTime array has insufficient elements: {}. Expected at least 6.", dateTimeParts.size());
                    return LocalDateTime.now();
                }

                return java.time.LocalDateTime.of(
                    dateTimeParts.get(0), // year
                    dateTimeParts.get(1), // month
                    dateTimeParts.get(2), // day
                    dateTimeParts.get(3), // hour
                    dateTimeParts.get(4), // minute
                    dateTimeParts.get(5), // second
                    dateTimeParts.size() > 6 ? dateTimeParts.get(6) : 0 // nano
                );
            } else if (dateTimeObj instanceof String) {
                // Handle string format
                return java.time.LocalDateTime.parse((String) dateTimeObj);
            } else if (dateTimeObj instanceof java.time.LocalDateTime) {
                return (java.time.LocalDateTime) dateTimeObj;
            } else {
                log.warn("DateTime has unexpected type: {}. Value: {}. Using current time.",
                        dateTimeObj.getClass().getName(), dateTimeObj);
                return LocalDateTime.now();
            }
        } catch (Exception e) {
            log.error("Failed to parse LocalDateTime. Value: {}. Using current time.", dateTimeObj, e);
            return LocalDateTime.now();
        }
    }
}
