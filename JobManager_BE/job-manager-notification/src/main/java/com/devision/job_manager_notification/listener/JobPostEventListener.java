package com.devision.job_manager_notification.listener;

import com.devision.job_manager_notification.dto.internal.InternalCreateNotificationRequest;
import com.devision.job_manager_notification.enums.NotificationType;
import com.devision.job_manager_notification.service.InternalNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Listens to job post events from job-manager-jobpost service and creates notifications.
 *
 * Events handled:
 * - jobpost.published: When a job post goes live
 * - jobpost.updated: When a job post is modified
 * - jobpost.expired: When a job post reaches its expiry date
 * - jobpost.unpublished: When a job post is taken down
 * - jobpost.deleted: When a job post is permanently deleted
 * - jobpost.skills.changed: When required skills are modified (CRITICAL for Ultimo)
 * - jobpost.country.changed: When location/country is changed (CRITICAL for Ultimo)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JobPostEventListener {

    private final InternalNotificationService internalNotificationService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy 'at' hh:mm a");

    /**
     * Handles job post published event
     */
    @KafkaListener(
            topics = "jobpost.published",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleJobPostPublished(
            @Payload Map<String, Object> payload,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        try {
            UUID companyId = parseUUID(payload.get("companyId"));
            UUID jobPostId = parseUUID(payload.get("jobPostId"));
            String title = (String) payload.get("title");
            LocalDateTime publishedAt = parseLocalDateTime(payload.get("publishedAt"));
            LocalDateTime expiryAt = parseLocalDateTime(payload.get("expiryAt"));

            log.info("Received jobpost.published event for jobPostId: {}, companyId: {} from partition: {}, offset: {}",
                    jobPostId, companyId, partition, offset);

            if (companyId == null || jobPostId == null) {
                log.error("Job post published event has null companyId or jobPostId, skipping");
                return;
            }

            String message = buildJobPostPublishedMessage(title, publishedAt, expiryAt);
            String metadata = buildJobPostMetadata(jobPostId, title, "PUBLISHED");

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(companyId)
                    .type(NotificationType.SYSTEM)
                    .title("🎉 Job Post Published Successfully")
                    .message(message)
                    .referenceId(jobPostId.toString())
                    .referenceType("JOB_POST_PUBLISHED")
                    .metadata(metadata)
                    .build();

            internalNotificationService.createNotification(notification);
            log.info("Successfully created job post published notification for jobPostId: {}", jobPostId);

        } catch (Exception e) {
            log.error("Error processing jobpost.published event: {}", e.getMessage(), e);
        }
    }

    /**
     * Handles job post updated event
     */
    @KafkaListener(
            topics = "jobpost.updated",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleJobPostUpdated(
            @Payload Map<String, Object> payload,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        try {
            UUID companyId = parseUUID(payload.get("companyId"));
            UUID jobPostId = parseUUID(payload.get("jobPostId"));
            String title = (String) payload.get("title");
            LocalDateTime updatedAt = parseLocalDateTime(payload.get("updatedAt"));

            log.info("Received jobpost.updated event for jobPostId: {}, companyId: {}", jobPostId, companyId);

            if (companyId == null || jobPostId == null) {
                log.error("Job post updated event has null companyId or jobPostId, skipping");
                return;
            }

            String message = String.format("Your job post \"%s\" has been updated successfully.",
                    title != null ? title : "Untitled Position");

            String metadata = buildJobPostMetadata(jobPostId, title, "UPDATED");

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(companyId)
                    .type(NotificationType.SYSTEM)
                    .title("✏️ Job Post Updated")
                    .message(message)
                    .referenceId(jobPostId.toString())
                    .referenceType("JOB_POST_UPDATED")
                    .metadata(metadata)
                    .build();

            internalNotificationService.createNotification(notification);
            log.info("Successfully created job post updated notification for jobPostId: {}", jobPostId);

        } catch (Exception e) {
            log.error("Error processing jobpost.updated event: {}", e.getMessage(), e);
        }
    }

    /**
     * Handles job post expired event
     */
    @KafkaListener(
            topics = "jobpost.expired",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleJobPostExpired(
            @Payload Map<String, Object> payload,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        try {
            UUID companyId = parseUUID(payload.get("companyId"));
            UUID jobPostId = parseUUID(payload.get("jobPostId"));
            String title = (String) payload.get("title");
            LocalDateTime expiredAt = parseLocalDateTime(payload.get("expiredAt"));

            log.info("Received jobpost.expired event for jobPostId: {}, companyId: {}", jobPostId, companyId);

            if (companyId == null || jobPostId == null) {
                log.error("Job post expired event has null companyId or jobPostId, skipping");
                return;
            }

            String message = buildJobPostExpiredMessage(title, expiredAt);
            String metadata = buildJobPostMetadata(jobPostId, title, "EXPIRED");

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(companyId)
                    .type(NotificationType.SYSTEM)
                    .title("⏰ Job Post Expired")
                    .message(message)
                    .referenceId(jobPostId.toString())
                    .referenceType("JOB_POST_EXPIRED")
                    .metadata(metadata)
                    .build();

            internalNotificationService.createNotification(notification);
            log.info("Successfully created job post expired notification for jobPostId: {}", jobPostId);

        } catch (Exception e) {
            log.error("Error processing jobpost.expired event: {}", e.getMessage(), e);
        }
    }

    /**
     * Handles job post unpublished event
     */
    @KafkaListener(
            topics = "jobpost.unpublished",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleJobPostUnpublished(
            @Payload Map<String, Object> payload,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        try {
            UUID companyId = parseUUID(payload.get("companyId"));
            UUID jobPostId = parseUUID(payload.get("jobPostId"));
            String title = (String) payload.get("title");

            log.info("Received jobpost.unpublished event for jobPostId: {}, companyId: {}", jobPostId, companyId);

            if (companyId == null || jobPostId == null) {
                log.error("Job post unpublished event has null companyId or jobPostId, skipping");
                return;
            }

            String message = String.format("Your job post \"%s\" has been unpublished and is no longer visible to applicants.",
                    title != null ? title : "Untitled Position");

            String metadata = buildJobPostMetadata(jobPostId, title, "UNPUBLISHED");

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(companyId)
                    .type(NotificationType.SYSTEM)
                    .title("📥 Job Post Unpublished")
                    .message(message)
                    .referenceId(jobPostId.toString())
                    .referenceType("JOB_POST_UNPUBLISHED")
                    .metadata(metadata)
                    .build();

            internalNotificationService.createNotification(notification);
            log.info("Successfully created job post unpublished notification for jobPostId: {}", jobPostId);

        } catch (Exception e) {
            log.error("Error processing jobpost.unpublished event: {}", e.getMessage(), e);
        }
    }

    /**
     * Handles job post deleted event
     */
    @KafkaListener(
            topics = "jobpost.deleted",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleJobPostDeleted(
            @Payload Map<String, Object> payload,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        try {
            UUID companyId = parseUUID(payload.get("companyId"));
            UUID jobPostId = parseUUID(payload.get("jobPostId"));
            String title = (String) payload.get("title");

            log.info("Received jobpost.deleted event for jobPostId: {}, companyId: {}", jobPostId, companyId);

            if (companyId == null || jobPostId == null) {
                log.error("Job post deleted event has null companyId or jobPostId, skipping");
                return;
            }

            String message = String.format("Your job post \"%s\" has been permanently deleted.",
                    title != null ? title : "Untitled Position");

            String metadata = buildJobPostMetadata(jobPostId, title, "DELETED");

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(companyId)
                    .type(NotificationType.SYSTEM)
                    .title("🗑️ Job Post Deleted")
                    .message(message)
                    .referenceId(jobPostId.toString())
                    .referenceType("JOB_POST_DELETED")
                    .metadata(metadata)
                    .build();

            internalNotificationService.createNotification(notification);
            log.info("Successfully created job post deleted notification for jobPostId: {}", jobPostId);

        } catch (Exception e) {
            log.error("Error processing jobpost.deleted event: {}", e.getMessage(), e);
        }
    }

    /**
     * Handles job post skills changed event (CRITICAL for Ultimo applicant matching)
     */
    @KafkaListener(
            topics = "jobpost.skills.changed",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleJobPostSkillsChanged(
            @Payload Map<String, Object> payload,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        try {
            UUID companyId = parseUUID(payload.get("companyId"));
            UUID jobPostId = parseUUID(payload.get("jobPostId"));
            String title = (String) payload.get("title");

            @SuppressWarnings("unchecked")
            List<String> addedSkills = (List<String>) payload.get("addedSkills");
            @SuppressWarnings("unchecked")
            List<String> removedSkills = (List<String>) payload.get("removedSkills");
            @SuppressWarnings("unchecked")
            List<String> currentSkills = (List<String>) payload.get("currentSkills");

            log.info("Received jobpost.skills.changed event for jobPostId: {}, companyId: {}, added: {}, removed: {}",
                    jobPostId, companyId, addedSkills, removedSkills);

            if (companyId == null || jobPostId == null) {
                log.error("Job post skills changed event has null companyId or jobPostId, skipping");
                return;
            }

            String message = buildSkillsChangedMessage(title, addedSkills, removedSkills);
            String metadata = buildSkillsChangedMetadata(jobPostId, title, addedSkills, removedSkills, currentSkills);

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(companyId)
                    .type(NotificationType.SYSTEM)
                    .title("🔧 Job Skills Updated")
                    .message(message)
                    .referenceId(jobPostId.toString())
                    .referenceType("JOB_POST_SKILLS_CHANGED")
                    .metadata(metadata)
                    .build();

            internalNotificationService.createNotification(notification);
            log.info("Successfully created job post skills changed notification for jobPostId: {}. This will trigger Ultimo re-matching.", jobPostId);

        } catch (Exception e) {
            log.error("Error processing jobpost.skills.changed event: {}", e.getMessage(), e);
        }
    }

    /**
     * Handles job post country changed event (CRITICAL for Ultimo applicant matching)
     */
    @KafkaListener(
            topics = "jobpost.country.changed",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleJobPostCountryChanged(
            @Payload Map<String, Object> payload,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        try {
            UUID companyId = parseUUID(payload.get("companyId"));
            UUID jobPostId = parseUUID(payload.get("jobPostId"));
            String title = (String) payload.get("title");
            String previousCountryCode = (String) payload.get("previousCountryCode");
            String newCountryCode = (String) payload.get("newCountryCode");
            String previousLocationCity = (String) payload.get("previousLocationCity");
            String newLocationCity = (String) payload.get("newLocationCity");

            log.info("Received jobpost.country.changed event for jobPostId: {}, companyId: {}, from: {} to: {}",
                    jobPostId, companyId, previousCountryCode, newCountryCode);

            if (companyId == null || jobPostId == null) {
                log.error("Job post country changed event has null companyId or jobPostId, skipping");
                return;
            }

            String message = buildCountryChangedMessage(title, previousLocationCity, newLocationCity,
                    previousCountryCode, newCountryCode);
            String metadata = buildCountryChangedMetadata(jobPostId, title, previousCountryCode, newCountryCode,
                    previousLocationCity, newLocationCity);

            InternalCreateNotificationRequest notification = InternalCreateNotificationRequest.builder()
                    .userId(companyId)
                    .type(NotificationType.SYSTEM)
                    .title("🌍 Job Location Updated")
                    .message(message)
                    .referenceId(jobPostId.toString())
                    .referenceType("JOB_POST_COUNTRY_CHANGED")
                    .metadata(metadata)
                    .build();

            internalNotificationService.createNotification(notification);
            log.info("Successfully created job post country changed notification for jobPostId: {}. This will trigger Ultimo re-matching.", jobPostId);

        } catch (Exception e) {
            log.error("Error processing jobpost.country.changed event: {}", e.getMessage(), e);
        }
    }

    // ==================== HELPER METHODS ====================

    private UUID parseUUID(Object value) {
        if (value == null) return null;
        if (value instanceof UUID) return (UUID) value;
        if (value instanceof String) {
            try {
                return UUID.fromString((String) value);
            } catch (IllegalArgumentException e) {
                log.warn("Failed to parse UUID from string: {}", value);
                return null;
            }
        }
        return null;
    }

    private LocalDateTime parseLocalDateTime(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDateTime) return (LocalDateTime) value;
        if (value instanceof List) {
            // Handle array format: [year, month, day, hour, minute, second, nano]
            @SuppressWarnings("unchecked")
            List<Integer> dateArray = (List<Integer>) value;
            if (dateArray.size() >= 6) {
                return LocalDateTime.of(
                        dateArray.get(0), // year
                        dateArray.get(1), // month
                        dateArray.get(2), // day
                        dateArray.get(3), // hour
                        dateArray.get(4), // minute
                        dateArray.get(5)  // second
                );
            }
        }
        return LocalDateTime.now();
    }

    private String buildJobPostPublishedMessage(String title, LocalDateTime publishedAt, LocalDateTime expiryAt) {
        StringBuilder message = new StringBuilder();
        message.append(String.format("Your job post \"%s\" is now live and visible to applicants! ",
                title != null ? title : "Untitled Position"));

        if (expiryAt != null) {
            message.append(String.format("It will remain active until %s.", expiryAt.format(DATE_FORMATTER)));
        }

        return message.toString();
    }

    private String buildJobPostExpiredMessage(String title, LocalDateTime expiredAt) {
        return String.format("Your job post \"%s\" has reached its expiry date and is no longer visible to applicants. " +
                "You can renew it to continue receiving applications.",
                title != null ? title : "Untitled Position");
    }

    private String buildSkillsChangedMessage(String title, List<String> addedSkills, List<String> removedSkills) {
        StringBuilder message = new StringBuilder();
        message.append(String.format("Required skills for \"%s\" have been updated. ",
                title != null ? title : "Untitled Position"));

        if (addedSkills != null && !addedSkills.isEmpty()) {
            message.append(String.format("Added: %s. ", String.join(", ", addedSkills)));
        }

        if (removedSkills != null && !removedSkills.isEmpty()) {
            message.append(String.format("Removed: %s. ", String.join(", ", removedSkills)));
        }

        message.append("We'll automatically re-match this position with qualified applicants.");

        return message.toString();
    }

    private String buildCountryChangedMessage(String title, String previousCity, String newCity,
                                               String previousCountry, String newCountry) {
        String location = newCity != null ? newCity + ", " + newCountry : newCountry;
        return String.format("The location for \"%s\" has been changed to %s. " +
                "We'll automatically re-match this position with applicants in the new location.",
                title != null ? title : "Untitled Position",
                location);
    }

    private String buildJobPostMetadata(UUID jobPostId, String title, String action) {
        return String.format("{\"jobPostId\":\"%s\",\"title\":\"%s\",\"action\":\"%s\",\"timestamp\":\"%s\"}",
                jobPostId,
                title != null ? title.replace("\"", "\\\"") : "Untitled Position",
                action,
                LocalDateTime.now());
    }

    private String buildSkillsChangedMetadata(UUID jobPostId, String title, List<String> added,
                                              List<String> removed, List<String> current) {
        return String.format("{\"jobPostId\":\"%s\",\"title\":\"%s\",\"addedSkills\":%s,\"removedSkills\":%s,\"currentSkills\":%s,\"action\":\"SKILLS_CHANGED\",\"timestamp\":\"%s\"}",
                jobPostId,
                title != null ? title.replace("\"", "\\\"") : "Untitled Position",
                toJsonArray(added),
                toJsonArray(removed),
                toJsonArray(current),
                LocalDateTime.now());
    }

    private String buildCountryChangedMetadata(UUID jobPostId, String title, String previousCountry,
                                                String newCountry, String previousCity, String newCity) {
        return String.format("{\"jobPostId\":\"%s\",\"title\":\"%s\",\"previousCountryCode\":\"%s\",\"newCountryCode\":\"%s\",\"previousCity\":\"%s\",\"newCity\":\"%s\",\"action\":\"COUNTRY_CHANGED\",\"timestamp\":\"%s\"}",
                jobPostId,
                title != null ? title.replace("\"", "\\\"") : "Untitled Position",
                previousCountry,
                newCountry,
                previousCity != null ? previousCity : "",
                newCity != null ? newCity : "",
                LocalDateTime.now());
    }

    private String toJsonArray(List<String> list) {
        if (list == null || list.isEmpty()) {
            return "[]";
        }
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            sb.append("\"").append(list.get(i).replace("\"", "\\\"")).append("\"");
            if (i < list.size() - 1) {
                sb.append(",");
            }
        }
        sb.append("]");
        return sb.toString();
    }
}
