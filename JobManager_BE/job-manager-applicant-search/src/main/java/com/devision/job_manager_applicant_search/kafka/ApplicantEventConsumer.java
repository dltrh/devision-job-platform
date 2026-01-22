package com.devision.job_manager_applicant_search.kafka;

import com.devision.job_manager_applicant_search.event.ApplicantProfileUpdatedEvent;
import com.devision.job_manager_applicant_search.service.MatchingService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Kafka consumer for applicant profile events from JA service.
 * 
 * Listens to:
 * - user-profile-create: New applicant profile created
 * - user-profile-update: Existing applicant profile updated
 * 
 * Both events have the same structure and trigger matching against saved search profiles.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicantEventConsumer {

    private final MatchingService matchingService;
    private final ObjectMapper objectMapper;

    /**
     * Consumes applicant profile CREATE events.
     * Triggered when a new applicant creates their profile.
     */
    @KafkaListener(
            topics = "user-profile-create",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void onApplicantProfileCreated(String message) {
        log.info("Received user-profile-create event");
        processApplicantEvent(message, "CREATE");
    }

    /**
     * Consumes applicant profile UPDATE events.
     * Triggered when an applicant updates their profile.
     */
    @KafkaListener(
            topics = "user-profile-update",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void onApplicantProfileUpdated(String message) {
        log.info("Received user-profile-update event");
        processApplicantEvent(message, "UPDATE");
    }

    /**
     * Process the incoming event and trigger matching.
     */
    private void processApplicantEvent(String message, String eventType) {
        try {
            JsonNode json = objectMapper.readTree(message);
            
            ApplicantProfileUpdatedEvent event = parseEvent(json);
            
            if (event.getApplicantId() == null) {
                log.warn("Received {} event with null applicantId, skipping", eventType);
                return;
            }

            log.info("Processing {} event for applicant: {}", eventType, event.getApplicantId());
            
            matchingService.processApplicantUpdate(event);
            
            log.info("Successfully processed {} event for applicant: {}", 
                    eventType, event.getApplicantId());
                    
        } catch (Exception e) {
            log.error("Error processing {} event: {}", eventType, e.getMessage(), e);
            // In production, consider dead-letter queue or retry mechanism
        }
    }

    /**
     * Parse JSON to ApplicantProfileUpdatedEvent.
     * Maps JA's event fields to our internal structure.
     */
    private ApplicantProfileUpdatedEvent parseEvent(JsonNode json) {
        UUID eventId = getUUID(json, "eventId");
        UUID userId = getUUID(json, "userId");
        String countryAbbreviation = getText(json, "countryAbbreviation");
        String educationLevel = getText(json, "educationLevel");
        List<UUID> skillIds = getUuidList(json, "skillIds");
        List<String> employmentTypes = getStringList(json, "employmentTypes");
        BigDecimal minSalary = getDecimal(json, "minSalary");
        BigDecimal maxSalary = getDecimal(json, "maxSalary");
        List<String> jobTitles = getStringList(json, "jobTitles");
        LocalDateTime createdAt = getDateTime(json, "createdAt");

        return ApplicantProfileUpdatedEvent.fromCreateEvent(
                eventId, userId, countryAbbreviation, educationLevel,
                skillIds, employmentTypes, minSalary, maxSalary, jobTitles, createdAt
        );
    }

    // Helper methods for JSON parsing

    private UUID getUUID(JsonNode json, String field) {
        JsonNode node = json.get(field);
        if (node == null || node.isNull()) return null;
        try {
            return UUID.fromString(node.asText());
        } catch (Exception e) {
            return null;
        }
    }

    private String getText(JsonNode json, String field) {
        JsonNode node = json.get(field);
        if (node == null || node.isNull()) return null;
        return node.asText();
    }

    private BigDecimal getDecimal(JsonNode json, String field) {
        JsonNode node = json.get(field);
        if (node == null || node.isNull()) return null;
        try {
            return new BigDecimal(node.asText());
        } catch (Exception e) {
            return null;
        }
    }

    private LocalDateTime getDateTime(JsonNode json, String field) {
        JsonNode node = json.get(field);
        if (node == null || node.isNull()) return null;
        try {
            return LocalDateTime.parse(node.asText());
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }

    private List<UUID> getUuidList(JsonNode json, String field) {
        JsonNode node = json.get(field);
        if (node == null || !node.isArray()) return new ArrayList<>();
        List<UUID> list = new ArrayList<>();
        for (JsonNode item : node) {
            try {
                list.add(UUID.fromString(item.asText()));
            } catch (Exception ignored) {}
        }
        return list;
    }

    private List<String> getStringList(JsonNode json, String field) {
        JsonNode node = json.get(field);
        if (node == null || !node.isArray()) return new ArrayList<>();
        List<String> list = new ArrayList<>();
        for (JsonNode item : node) {
            list.add(item.asText());
        }
        return list;
    }
}
